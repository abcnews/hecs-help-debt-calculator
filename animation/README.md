Animation
=========

The graduation cap animation was converted from a Lottie animation to a 60 FPS transparent video in WebM (VP9) and MP4 (H.265) formats. Both formats combined should provide compatibility with all modern browsers.


Conversion steps
----------------

Requires `ffmpeg` on Mac compiled with `--enable-libvpx` and `--enable-videotoolbox`.

* Download original [graduation cap](https://googlefonts.github.io/noto-emoji-animation/?selected=Animated%20Emoji:emoji_u1f393::) animation in Lottie format
* Convert Lottie to high-quality WebM using [IconScout](https://iconscout.com/converter/lottie-to-webm). Requires a free account. [Working accounts are listed here](https://bugmenot.com/view/iconscout.com)
* Create optimised WebM file: `ffmpeg -vcodec libvpx-vp9 -i graduation-cap.1f393.lottie.webm -s 200x200 -crf 20 -vcodec libvpx-vp9 -pix_fmt yuva420p graduation-cap.webm`
* Create optimised MP4 file: `ffmpeg -vcodec libvpx-vp9 -i graduation-cap.1f393.lottie.webm -s 200x200 -c:v hevc_videotoolbox -allow_sw 1 -alpha_quality 0.9 -vtag hvc1 -b:v 400k -profile:v 1 graduation-cap.mp4` [^1]

[^1]: As of May 2023 the x265 library cannot generate an MP4 (H.265) video with alpha transparency. If this is fixed in the future, the following command may work: `ffmpeg -vcodec libvpx-vp9 -i graduation-cap.1f393.lottie.webm -s 200x200 -crf 20 -vcodec libx265 -pix_fmt yuva420p graduation-cap.x265.mp4` (This command would not require a Mac nor the `--enable-videotoolbox` compilation flag.)


Attibution
----------

"[Graduation-cap](https://googlefonts.github.io/noto-emoji-animation/?selected=Animated%20Emoji%3Aemoji_u1f393%3A:)" by [The Noto Project Authors](https://googlefonts.github.io/noto-emoji-animation/) is licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)