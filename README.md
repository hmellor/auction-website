# Auction Website

This repo contains the code to host an auction website for free using the GitHub static hosting and Firebase authentication and databases.

This is a project I worked on for a charity as a pet project and so the functionality is very bespoke and not perfect (as much as I tried to make it). If you would like to contribute to making this codebase more general I welcome you to create pull requests with your improvements.

## Functionality

- Device based login requiring only the user's name (no need to store sensitive information).
- Extra information about auctions including additional images.
- Realtime bidding using event listeners (no need to refresh page).


![](./readme/homepage.png) ![](./readme/loginpage.png)

![](./readme/infopage.png) ![](./readme/bidpage.png)

## Usage

Make sure you have node installed and then initialise the repository as follows
```
git clone https://github.com/HMellor/auction-website.git
cd auction-website
npm install
```
For development you can use `gulp` to locally host a server that dynamically compiles minified code as you write it.
```
cd /path/to/auction-website
gulp
```
To link to Firebase:
- Create a firebase project.
- Create a web app inside that project.
- Go to the web app's settings copy everything inside `firebaseConfig` to the `firebaseConfig` variable in `index.html`
- Go to Authentication > Sign-in method > Anonymous and enable anonymous sign-in.
