---
title: "How to compose the ideal prompt?"
description: >-
  A comprehensive guide on creating effective prompts for AI image generation,
  including tips, examples, and tools for users at all levels to improve their
  output quality with Imagine App and other tools.
date: 2024-06-10T00:00:00Z
author: RvalReal
categories:
  - Artificial Intelligence
  - Design
  - Technology

tags:
  - AI Prompt Engineering
  - Image Generation
  - Stable Diffusion
  - Imagine App
  - Prompt Techniques

slug: how-to-compose-the-ideal-prompt
language: en
reading_time: 9
featured_image: https://pbs.twimg.com/media/GLw8U37XQAAJuVK?format=jpg&name=small
keywords: >-
  AI prompts, image generation, Imagine App, prompt engineering, Stable Diffusion,
  AI prompt tools, negative prompts, AI art creation, prompt builders
---

# How to compose the ideal prompt?

In this article, I will share with you the secrets and subtleties of creating the perfect prompt to generate your image and show you a few services that will greatly simplify your work. This article is intended for beginners, but even if you are an experienced user, I'm sure you will find something useful for you in this article!

For image generation I will use [Imagine App](https://imagine.heurist.ai/) - is a Stable Diffusion image generator by @heurist_ai  

When working with Stable Diffusion and other similar systems, the most successful results can be obtained by making detailed prompts. Here is how to do it correctly.

## Specify all important details

First, you need to come up with the purpose of the request and the approximate result, what style it should be presented in and what the picture should not depict.

A proper prompt should have a subject or object that we want to see in the image. We need to specify what this subject is doing, its location, and then any additional keywords. A complex request may also include a detailed description of the type of image: drawing, realistic photograph, landscape. Often this property can be activated in the service settings.

The closer it is to the top of the request, the more power it has in generating the image. You can specify the importance or "weight" manually for each element. This is usually written after a colon without a space, for example: weight:1.5, weight:0.4.

In detailed queries, it is worth using additional words that will help the AI to find the most successful variant. Describe all the characteristics you can think of for a particular task.

## Unnecessary elements and characteristics

A negative prompt can also be helpful when creating a request. This is a list of all properties that should not be present in the image. It often includes context-dependent points.

You may need to exclude deformed body parts, a second person in the frame, blurriness, poor quality, and other such things. Negative prompt will help you collect footage with fewer artifacts. But you don't have to make huge lists of negatives - basic keywords are enough.

## Parameters in the request settings

- **Sampling Steps** -  Indicates the number of steps the AI will take to go from random noise to a recognizable image. The more steps there are, the higher is usually the quality of the result 
- **Guidance Scale** - This method uses unconditional and conditional generation, which are multiplied with each other. Roughly speaking, an image is first generated without considering the textual cue, and then with it. The higher the Scale, the more the conditional image will dominate. This is necessary so that we can get either more variability of generation or more accuracy. It turns out that the lower this parameter is, the freer AI is in its actions, and the higher it is, the more constrained it is.
- **Seed** - Is the reference point from which the system generates the picture. Initially, a "random" parameter from billions of variants is specified. This helps to get different results for the same request. If you use a specific value, the content of the image will remain roughly similar when you change the prompt.
- **Resolution** - Is the size of the image.

## Useful tools

A beginner is better off using a prompt builder to get started. 

- [Promptomania](https://promptomania.com/stable-diffusion-prompt-builder/) - The most popular prompt constructor with a large number of customizations. It is suitable for different AI, including a section for Stable Diffusion.
- [Prompthero](https://prompthero.com/) - An image search tool that uses advanced artificial intelligence models to give you a wide range of options based on your descriptions and search terms. It's a fun way to explore the art world and find unique and amazing images
- [Drawingprompt](https://drawingprompt.com/) - Generator of prompts for creating images on different topics. The perfect tool for people with a bad imagination
- [Prompt generator](https://huggingface.co/spaces/doevent/prompt-generator) - Generates several variations of the prompts for your request. To use it, just submit your text or click one of the examples to load them
- [Сomparing captioning models](https://huggingface.co/spaces/nielsr/comparing-captioning-models) - Service that generates prompts based on an uploaded picture. Perhaps you have some beautiful image, but you are not able to compose a prompt for generation, then this service is for you

## For what purposes you can use the Imagine App

Stable Diffusion can generate images in a large number of styles. Imagine App by [heurist_ai](https://x.com/@heurist_ai)  allows you to select several different models that generate an image in different styles. You can read more about styles on the platform [in this article](https://twitter.com/GriseldaVi24827/article/1777851244666654997) by @GriseldaVi24827. 

1. For photorealistic images

One of the most important is photorealism. You are unlikely to get a perfect result the first time, but after a series of attempts you can generate impressive images.

Examples of possible queries:

`Уoung woman in fabulous dress, photorealism, dark hair, centered in the frame, symmetrical face, 50 mm lens, facing camera, dark background, natural light, out of focus mountains in the background, ultra‑details, 16K.`

![Virtual Idol](https://pbs.twimg.com/media/GLxpwuNWkAEJkY4?format=png&name=900x900)

`epic dark shot, filled with green jungle, panther looking sharp through the leaves, eyes, (extreme closeup:1.2), hunting, depth of field, cinematic, slate gray atmosphere, muted colors, rim light, by greg rutkowski, looking straight to the camera, low angle`

![Virtual Idol](https://pbs.twimg.com/media/GLxsfQ6WwAAq50O?format=png&name=900x900)

Suitable negative details for requests: (deformed, distorted, disfigured:1.3), poorly drawn, out of frame, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur.

2.  For animated pictures

AI allows you to create animated images of any complexity, but to get a good result you will have to fiddle with the assembly of the request.

Examples of possible queries:

`immortal being samurai as evil monster, fight, chinese mythological legends, movie still, film grain, cinematic, vsco, surreal, exquisite details, rutkowski, llustration art`

![Virtual Idol](https://pbs.twimg.com/media/GLySS13XsAAx1ay?format=png&name=small)

`lushill style, mystical, transparent, ghost cat of the milky way, Trending on Artstation, AIart, by Charlie Bowater, Illustration, Color Grading, Filmic, Nikon D750, Brenizer Method, Side-View, Perspective, Depth of Field, Field of View, Lens Flare, Tonal Colors, 8K, Full-HD, ProPhoto RGB, Perfectionism, Rim Lighting, Natural Lighting, Soft Lighting, Accent Lighting, Diffraction Grading, With Imperfections, insanely detailed and intricate, hypermaximalist, elegant, ornate, super detailed`

![Virtual Idol](https://pbs.twimg.com/media/GLxzjy4XAAAgkOJ?format=png&name=900x900)

`Kyoto Animation stylized anime mixed with tradition Chinese artworks. A dragon flying at modern cyberpunk fantasy world. Cinematic Lighting, ethereal light, intricate details, extremely detailed, incredible details, full colored, complex details, insanely detailed and intricate, hypermaximalist, extremely detailed with rich colors. masterpiece, best quality, aerial view, HDR, UHD, unreal engine. plump looking at the camera, smooth thighs, (glittery jewelry) ((acrylic illustration, by artgerm, by kawacy, by John Singer Sargenti) dark Fantasy background, glittery jewelry, Representative, fair skin, beautiful face, Rich in details High quality, gorgeous, glamorous, 8k, super detail, gorgeous light and shadow, detailed decoration, detailed lines`

![Virtual Idol](https://pbs.twimg.com/media/GL8W6gXWsAIbqg_?format=jpg&name=900x900)

Suitable negative details for requests: (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur

3. For artistic landscapes

Imagine App generates great landscapes, such as an autumn forest in the setting sun, fantastic castles, beaches or futuristic cities.

An oil painting in the style of Hildebrandt of the view from inside an ancient tree, overlooking a white elven city in the distance with mountains and forests around it.

![Virtual Idol](https://pbs.twimg.com/media/GLx8vqqXEAA-OT7?format=png&name=900x900)

4. For portraits

Imagine App does a good job of generating portraits, but it is still difficult to achieve super-realism. But the neural network will be useful for testing variants of real shooting or, for example, comics.

`(masterpiece, best quality) , 1lady, solo, anime girl wearing skull facemask, in the style of cyberpunk imagery, full body, realistic hyper-detailed portraits, womancore, metallic accents, outrun, hyper-realistic pop, angelcore, illustration, ink artistic conception, with typography elements, abstract, complementary colors, mosaic of characters, wallpaper style, simplicity, Chinese painting, black background`

![Virtual Idol](https://pbs.twimg.com/media/GLyEF1pXUAAsf5B?format=png&name=small)

Suitable negative details for requests: (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face.

5. For character generation

In Imagine App you will be able to create beautiful shots with famous characters

A cinematic shot of a Batman, filmed on Red V‑Raptor 8K camera, 50 mm, f/1.4, film director David Fincher, chiaroscuro, full‑body, futuristic cyberpunk costume, magic realism.

![Virtual Idol](https://pbs.twimg.com/media/GLyFEDQXUAMyy-R?format=png&name=900x900)

Detailed 8k image of One‑Punch Man, japanese architecture at night. Illustration, realistic, anime, volumetric lighting.

![Virtual Idol](https://pbs.twimg.com/media/GLyHOq5X0AASi0M?format=png&name=900x900)

6. For creating architectural objects

You can also create conceptual images of buildings in any style. Neural network often makes mistakes in lines and shapes of complex objects - you will have to repeat the generation process until you get a successful result.

Exterior shot of a villa in Mykonos, with sea view, white and blue colours mood, volumetric lighting, high quality, 8k, ultra realism, high resolution photography

![Virtual Idol](https://pbs.twimg.com/media/GLyI0DEW4AAbF9M?format=png&name=900x900)

Suitable negative details for requests: (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, people, human, signature, watermark, sign.

7. For interior design

AI is also suitable for preparing interior design of rooms. Use it if you want to find unusual options for the design of your house or apartment.

Kitchen in the style of Sou Fujimoto, wide angle view of a vibrant city in the windows, interior architecture, rendered in octane, photorealistic, highly detailed

![Virtual Idol](https://pbs.twimg.com/media/GLyJgXKXEAA8rlU?format=png&name=900x900)

Suitable negative details for requests: (deformed, distorted:1.3), poorly drawn, disgusting, blurry, people, human, signature, watermark, sign

8. For creating images of clothing

AI offers good images with clothes, but you'll have to experiment with queries and repeat the process many times for successful images.

Techwear clothes and fashion look, feet to head, golden ratio, futuristic, highly detailed, Errolson Hugh, Yohji Yamamoto, Nike ACG, hyper maximalist.

![Virtual Idol](https://pbs.twimg.com/media/GLyKh8dWoAAXxno?format=png&name=900x900)

Suitable negative details for requests: (deformed, distorted, disfigured:1.3), bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutated, blurry.

9. For logo creation

AI will also come in handy during the formation of an organization's identity. With the help of Imagine App you will be able to test different logo ideas in any style. Be prepared for constant adjustments to requests.

Logo for a technology company, HEURIST lettering, symmetrical, illustration, vector art, logo design

![Virtual Idol](https://pbs.twimg.com/media/GLyMnBCWwAA8Fgj?format=png&name=900x900)

Suitable negative details for requests: (deformed, distorted, disfigured:1.3), poorly drawn, disgusting, blurry, people, human, signature, watermark

**Thanks for reading, I hope you were able to learn something new, have a good journey in the world of AI!**

## Official Links:

- Twitter -  <https://twitter.com/heurist_ai>
- Website - <http://heurist.ai/> 
- Imagine App - <http://imagine.heurist.ai/> 
- Pondera App- <http://pondera.heurist.ai/>
- Medium - <https://heuristai.medium.com/>
- Gitbook - <https://docs.heurist.xyz/>
