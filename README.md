This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## Test instructions

1. Clone or download the project and open a terminal in the project folder.
2. Install dependencies by running npm install.
3. Start the development build with npm run dev.
4. Open Chrome and go to chrome://extensions/.
5. Enable Developer mode in the top-right corner.
6. Click Load unpacked and select the folder ~/fillr/build/chrome-mv3-dev.
7. Open one of the .html files in the folder /examples included in the project root in Chrome.
8. Right-click anywhere on the demo form page to access the context menu and click 'Fill from...'
9. Click 'Image' button and use the respective sample image provided the /examples directory.
10. Fillr.ai will extract the values from the image and populate the form fields in real time.

Note: this extension requires the multimodal features of prompt api to be enabled.
