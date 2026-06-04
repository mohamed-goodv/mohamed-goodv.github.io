import type { ProfileConfig } from "../types/config";

// 个人资料配置
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpeg", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
	name: "Stinger",
	bio: "Bug hunter & CTF player",
	typewriter: {
		enable: true, // 启用个人简介打字机效果
		speed: 80, // 打字速度（毫秒）
	},
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/mohamed-goodv",
		},
		 {
        name: "LinkedIn",
        icon: "fa7-brands:linkedin",
        url: "https://linkedin.com/in/xemyx",
    },
    {
        name: "HackTheBox",
        icon: "simple-icons:hackthebox",
        url: "https://app.hackthebox.com/profile/2354788",
    },
	],
};
