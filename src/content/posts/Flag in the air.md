---
title: Flags in the Air— Web CTF Challenge by connectors
published: 2025-09-14
description: Web CTF Challenge by connectors
tags:
  - CTF
  - Logic
  - JWT
category: CTF
draft: false
pinned: false
---
## بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ

![](https://miro.medium.com/v2/resize:fit:526/1*1kct6CltfN3w_k-PVk7PcQ.png)

Source code Download from [here](https://github.com/MushroomWasp/blog/blob/main/flags-in-the-air/FlagsInTheAir.zip)

The challenge was a login page without a registration page. The first thing I tried was injecting some SQLi payloads, but they all failed.

After that, I opened the source code to look for leaked credentials, but I didn’t find anything.

However, I noticed **something**. In `config.py`, there was a secret key: `a-very-secret-key`. The `Dockerfile` also **had** another secret key: `your-secret-key`

So I tried to generate a **JWT** token with admin credentials.

in `auth.py`

```python
payload = {  
        'exp': datetime.now(timezone.utc) + timedelta(hours=1),  
        'iat': datetime.now(timezone.utc),  
        'sub': username,  
        =='access'====: access_level  
    }==    ==return== ==jwt.encode(  
        payload,  
        current_app.config[===='SECRET_KEY'====],  
        algorithm====='HS256'==    ==)==
```

That was the payload. So, I **went** to `jwt.io` and generated a token with full access.

I then tried to go to the `/data` directory with the generated token, but I **failed**. I also tried it with 2FA access and **failed** again.

Now, it’s time to analyze the source code,

starting with the `/login` route in the `app.py` file.

```python
@app.route('/login', methods=['GET', 'POST'])  
def login():  
    if request.method == 'GET':  
        return render_template('login.html')  
  
    data = request.get_json()  
  
    username = data.get('username')  
    password = data.get('password')  
  
    if username in TWO_FA_CODES:  
        TWO_FA_CODES[username] = None  
  
    if USERS.get(username) == password:  
        code = generate_2fa_code()  
        TWO_FA_CODES[username] = code  
          
        token = generate_jwt(username, '2fa')  
          
        print(f"Generated 2FA code for {username}: {code}")  
        return jsonify({"message": "2FA required", "token": token})  
  
    return jsonify({"message": "Invalid credentials"}), 401
```

First, it gets the username and checks if it exists in the `TWO_FA_CODES` dictionary. If it does, the code sets that 2fa value to `None`.

After that, it checks if the provided password is valid and then generates a 2FA code,

it **doesn’t** check **if** the username **exists** in the `USERS` table. So, I tried to **enter** a **non-existent** user with a null password to see what would happen.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*23h3m42_LgJq2pmYbR_bqw.png)

As you can see, it gave me the 2FA token.

Next, I examined the `/verify-2fa` route

```python
@app.route('/verify-2fa', methods=['GET', 'POST'])  
def verify_2fa():  
    if request.method == 'GET':  
        return render_template('verify_2fa.html')  
  
    @token_required('2fa')  
    def post_verify_2fa(current_user=None):  
        data = request.get_json()  
        code = data.get('code')  
          
        if not current_user:  
            return jsonify({"message": "Auth token is missing!"}), 401  
  
        if TWO_FA_CODES.get(current_user) == code:  
            del TWO_FA_CODES[current_user]  
              
            token = generate_jwt(current_user, 'full')  
            return jsonify({"message": "Login successful!", "token": token})  
  
        return jsonify({"message": "Invalid 2FA code"}), 401  
      
    return post_verify_2fa()
```

This endpoint retrieves the 2FA code from the request data and compares it with the code stored in the `TWO_FA_CODES` dictionary for the current user. If they match, it deletes the 2FA code from the dictionary and generates a new JWT token with a 'full' access.

So, in the `/verify-2fa` route, I tried to bypass it with many tricks, one of which was using a **null** value. When I tried this, it worked, but to be honest, that was just my luck! 😂

I will now explain why this **normally wouldn’t work**.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*O8SxcXqG-H9e00w0MSkENA.png)

When I went back to the source code, I looked at the `/login` route again.

[](https://medium.com/write?source=promotion_paragraph---post_body_banner_better_place_scribble--c3a7b66f4398---------------------------------------)

If the username exists, the code sets that user’s 2FA value to `None`, and if the password is correct, it generates a new token.

This led me to wonder: what would happen if I entered an invalid password?

So, I entered the correct username with a wrong password.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*y9PhnOknjohLtI9XcZ3sUA.png)

The 2FA value should set to `None`.

So, we will try the `null` payload again, this time with the `code` parameter.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*grT4-yoYf9AX8GW8h1mlDQ.png)

It **gave** me **a new** token with full access and redirected me to the `/dashboard` page.

This was a page that allowed for command execution,

so I tried running the `ls` command.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*Z5NFk7xJZjRG40d_r0e8fg.png)

tried to get the flag in multiple ways, but I couldn’t.

However, I remembered seeing a **Dockerfile** when I first looked through the source code.

When I opened it, this is what I saw:

```bash
CMD sh -c "(while true; do echo '[DEBUG] healthcheck ok'; sleep 5; done) & \  
           (while true; do echo '[DEBUG] Flag{......}' >&1; sleep 10; done) & \  
           rm Dockerfile && python app.py"
```
This line **meant that** the server **echoes** the flag every 10 **seconds**.

I **tried** the `ps aux` command and anther commands, but they all **failed**. So, I passed the **Dockerfile** to an AI for help, and it **gave** me the following command:

timeout 15 cat /proc/1/fd/1

I didn’t know what this was, so I asked the AI to explain it to me:

- `timeout 15`: This **makes** the **following** command **execute** for a 15 **seconds**.
- `/proc/1/fd/1`: This is the file descriptor for **standard output** in Linux.

So, this payload tells the server to **capture** the output from that file descriptor for up to 15 **seconds**.

Press enter or click to view image in full size

![](https://miro.medium.com/v2/resize:fit:700/1*MatWZigwXTTDuEwVwIeuJA.png)

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

تم بحمد الله✨