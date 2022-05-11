*Currently the project is work in progress. See an older version of the website & PWA [here](https://oramava.nomomon.repl.co/).*

---

![Orama Visual Assistant banner](https://nomomon.github.io/images/oramava-preview.jpeg)
# Orama Visual Assistant

[Pitch video](./README.md#pitch-video) <br>
[Story behind the project](./README.md#story-behind-the-project) <br>
[Project time line](./README.md#project-time-line) <br>
[WIP / For future](./README.md#wip--for-future) <br>
[License](./README.md#license) <br>


**Orama Visual Assistant** (from Greek: *Όραμα*, meaning *"vision"*) is an app for visually impaired people that announces objects detected using user's phone camera.

Our goal is to help visually impaired people to become more independent.

## Pitch video

<p align="center">
  <a href="https://www.youtube.com/watch?v=a6ABuAaqgfA">
    <img width="450" src="https://i.ytimg.com/vi/a6ABuAaqgfA/maxresdefault.jpg"/>
    <br>
    Link to the pitch video on YouTube
  </a>
<p>
  
## Story behind the project
We are the Nurmukhambetov family. There are seven of us in the family: mom, dad, four sons and a daughter. Three of the sons seen in the photograph developed this project.
  
> “Our youngest daughter, Sofia, drove us to create this project. Sofia, was born prematurely, from birth we fought for her life, they tried as much as possible to save her eyesight. In consequence of 12 operations, we were able to save Sofia's light perception. But this is not enough, in order to live a full-fledged life on her own, she needs outside help.”
> 
> ‒ Damira Nurmukhambetova
<p align="center">
  <img width="450" src="https://oramava.nomomon.repl.co/app/images/family.jpg"/>
<p>
  
## Project time line
  
<dl>
  <dt>Nov 2019</dt>
  <dd>We began brainstorming on the ideas.</dd>
  
  <dt>Dec 2019</dt>
  <dd>First demo made using KNN algorithm on images.</dd>
  
  <dt>Apr 2020</dt>
  <dd>Classification MobileNetv2 model trained with transfer learning (<a href='https://teachablemachine.withgoogle.com/'>Teachable Machine</a>).</dd>
  
  <dt>May 2020</dt>
  <dd>Third place finalists at HackDay 2020. First funding of the project.</dd>
  
  <dt>Jul 2020</dt>
  <dd>Finalists across the Aisa continent at <a href='https://www.curiositymachine.org/about/'>Technovation Famlies</a>.</dd>

  <dt>Jan 2022</dt>
  <dd>Change from image classification to object detection (<a href='https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1'>SSD Mobile Netv2</a>). Change from naming everything to search for an object task. </dd>
  
  <dd>OCR functionality with <a href='https://tesseract.projectnaptha.com/'>Tesseract</a>. It is there, but it has bad performance.</dd>

  <dt>Mar 2022</dt>
  <dd>Began working on a react native version of the app.</dd>
</dl>

## WIP / For future

- [ ] Improve OCR reader.
- [ ] Change to React Native.
- [ ] Transfer to cloud processing rather than on-device.
- [ ] Currency classification. Name what banknote that is seen in the camera.
- [ ] Facial recognition. Each user will have their own pool of people saved in the app for future facial recognition tasks.
- [ ] Image description. Describe what's in the image.
- [ ] _'Open with OramaVA'_ on images to do OCR/ facial recognition/ image description.
 
## License
All of the codebase is **MIT Licensed** unless otherwise stated.
