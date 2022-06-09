# Fire React Base
Fire React Base is a template for creating web apps with Firebase and React.js.

## Featured NPM libraries:
* react 
    * Component organization and front end rendering
* firebase
    * Database, authentication, server side functions, file storage, etc
* react-router-dom
    * Link and page navigation
* styled-components
    * JavaScript CSS styling
* polished 
    * Supplementary library to styled-components that provides utility functions to manipulate CSS
* react-helmet-async
    * Dynamic page meta data, such as page title
* react-grid-system
    * Responsive grid system
* react-image-lightbox
    * Enlarging images for easy viewing mobile and desktop
* react-hook-form
    * Breezy form building
* react-toastify
    * Notification alerts
* react-confirm-alert
    * Confirmation dialogues
* react-icons
    * Popular icon usage like font Awesome

## Initialization

**1. Create Github project using this template**
   - Name with a dash `-` instead of a dot `.` such as `appname-com` to line up with Firebase project name

**2. Clone this new Github project to desktop for setup**

**3. Create 2 Firebase projects (live and test) for this new site @ https://console.firebase.google.com/**
   - Names with a dash `-` instead of a dot `.` such as `appname-com` to match GitHub repo name
   - Initialize Analytics, Authentication, Firestore, Storage, Hosting, and Functions in the Firebase project console by clicking through those tabs on the left
   - Add a web app under Gear > Project Settings > Your Apps, then grab the Config snippet to copy past in a `.env` file (copy and rename `template.env` to `.env`)
   - You be prompted for Blaze billing in Functions tab, enable and set an alert to like $25, this won't cost much unless your app blows up!

**4. Install NPM libraries**
   - Run `npm install` in the terminal window in main directory
   - Navigate to functions directory with `cd ./functions/` then run `npm install` there as well, then back to main directory `cd ../`

**5. Set new Firebase project aliases**
   - Delete file `.firebaserc`
   - $ `firebase use --add` once for each 'live' and 'test'

**6. Set Firebase Function variables (SendGrid)**
   - $ `firebase functions:config:set sendgrid_api.key="SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" --project test`
   - $ `firebase functions:config:set sendgrid_api.key="SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" --project live`

**7. Enable MFA on GCP** 
- Enable multi-factor authentication (MFA) for this new project: https://console.cloud.google.com/marketplace/details/google-cloud-platform/customer-identity?project=test-fire-react-base
- Add a test phone number with a test code to use for ever login (like +11234567890 and 123123) AND add the authorized domain if custom domain.

**8. Set `cors.json` to include relevant domains**
   - This is needed to load fonts from the URL they are store under
   - See https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin 

**9. Search for TODOs around code**
   - "Fire React Base" / "fire-react-base" usages replaced by your app name in some places
   - Update `name` in `package.json` from `fire-react-base` to your appname
   - Update `robots.txt` to be the main domain for this site, with extension path of `/sitemap.xml`. This is used for SEO.
   - Update `sitemap.xml` to be the main domain for this site with current date. Remember to come back to this file and update the paths for SEO!
   - Update `manifest.json` to be this app's name and colors. This file is used for installing the web app on mobile and desktop devices.
   - Update `index.html` in `public` folder such as default `<title>`, `theme-color`, `description`, and more
   - Update `README.md`, at least the title and description to this project. I just copy-paste the same description used in `index.html`.

**10. Add in icons to public**
   - Use this site to generate icon from PNG file (https://favicon.io/), then add that 32x32, 192, and 512 icon files to the `public` folder in the project

**11. Update font at `App.css` in src assets**
   - font `.ttf`/`.otf` font file placed in assets > fonts

**12. You may want to adjust the Headers such as the Content Security Policy to match your exact app needs.**
   - Check `firebase.json`
   - https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#mitigating_cross-site_scripting
   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
   - https://www.permissionspolicy.com/


**13. Build**
   - $ `npm run-script build`
   - $ `npm run-script build:test1` if using another `.env`

**14. Deploy to alias**
   - $ `firebase deploy --project=live`
   - Note that any Firebase Hosting accessed will always use the `production` environment, and live (not localhost) links, will always be at the `live` Firebase project! i.e. `test-fire-react-base` is still using the `fire-react-base` project env.

**99. Extra Config**
   - If custom domain, add it to the authorized domain in Firebase console > Authentication > Sign in Method 
       - Make sure to add `appname.com` and `www.appname.com`
       - You can add a redirect from `appname.web.app` & `appname.firebaseapp.com` to your custom domain by adding to `firebase.json`:
       ```
        "hosting": {
            "public": "build",
            "redirects": [
                    {
                    "source": "/",
                    "destination": "https://www.website.com/",
                    "type": 301
                    }
                ],
            ....
        }
        ```
   - For extra security, limit your API keys to certain functions, domains, etc
       - https://console.cloud.google.com/apis/credentials

## Customization

**1. Default `site` collection created when the first user doc is added and is auto set to be a super admin.**

**2. Edit the site and theme details on the `Manage Site` tab of the Admin Dashboard.**

**3. Any further customizations would be done through hard coding the source code. Have fun coding!!**

## Multiple Firebase project .env's 
Building from multiple .env files is using the library installed by `npm install env-cmd`.

**1. Create or use another Firebase project and get the config variables to place in our `.env.test1` file. Make sure to set all the steps above that pertain to a Firebase project being used with this template.**
   - See `package.json` for npm build changes for .test1, etc

**2. Add the newly created Firebase project to this React project**
   - $ `firebase use --add`

**3. Run a test environment (.env file is different)**
   - $ `npm run-script start:test1`

**4. Build a test environment (.env file is different)**
   - $ `npm run-script build:test1` 

**5. Deploy to test environment**
   - $ `firebase deploy --project=test --only hosting`

## Multiple hosting URLs for one Firebase project 
Sometimes you may want to showcase a quick frontend draft for the client. You can deploy that build directly to a new hosting URL like "draft1"

**1. Name the two targets you wish, but first make sure these are hosting site names on each of test and live projects:**
   -  $ `firebase target:apply hosting draft draft-appname`  
   -  $ `firebase target:apply hosting prod prod-appname`  
 
**2. Then update `firebase.json` file like so:**
```
...
"hosting": [
    {
      "target": "draft",
      "public": "build",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "target": "prod",
      "public": "build",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}

```  

**3. Then deploy to specific target like so:**
   - $ `firebase deploy --only hosting:draft --project=test`

**4. Clear target names:**
   - $ `firebase target:clear hosting draft`

## Misc:
- More Firebase CLI commands: https://firebase.google.com/docs/cli
