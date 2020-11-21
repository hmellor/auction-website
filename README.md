# Auction Website

This repo contains the code to host an auction website for free using the GitHub static hosting and Firebase authentication and databases.

This is a project I worked on for a charity as a pet project and so the functionality is very bespoke and not perfect (as much as I tried to make it). If you would like to contribute to making this codebase more general I welcome you to create pull requests with your improvements.

## Table of contents
- [Table of contents](#table-of-contents)
- [Functionality](#functionality)
- [Installation](#installation)
- [Setup](#setup)
  - [Adding auction information](#adding-auction-information)
  - [Compiling JavaScript and CSS](#compiling-javascript-and-css)
  - [Hosting development server](#hosting-development-server)
  - [Firebase setup](#firebase-setup)
    - [Creating a project](#creating-a-project)
    - [Authentication](#authentication)
    - [Database](#database)
  - [Creating an admin account and initialising your auctions](#creating-an-admin-account-and-initialising-your-auctions)

## Functionality

- Device based login requiring only the user's name (no need to store sensitive information).
- Extra information about auctions including additional images.
- Realtime bidding using event listeners (no need to refresh page).

![](./readme/homepage.png) ![](./readme/loginpage.png)

![](./readme/infopage.png) ![](./readme/bidpage.png)

## Installation

Make sure you have node installed and then initialise the repository as follows
```
git clone https://github.com/HMellor/auction-website.git
cd auction-website
npm install
```

## Setup
Here we will cover how to add your own information to the auctions themselves, then how to most a local server to see your changes and finally how to connect it all to Firebase to enable user login and bidding.

### Adding auction information
First you add the titles and information about each auction in the two string arrays, `items` and `info`, in `js/auctions.js`.  Make sure that you add the titles and info in the same order so that the correct information is displayed with each auction.

Then you add your photos for each auction using the zero-indexed format `img/item5.png` and if you have extra photos you'd like to show, `img/item5-extra.png`.
Where `img/item5-extra.png` is a single tall image in which you have stacked all of your extra photos. If you do have extra images you will need to go to `js/popups.js` and add the auction number to the `extraImages` array that is declared near the top of the file.

Finally, now that you have made your auctions look pretty you will need to go back to `js/auctions.js` to set their reserve prices and their end times.
Reserve prices are set in the `minimumBid` array in the same order as the `items` and `info` arrays.
The format of this template auction takes place over two nights. You chose the finish times of each night by setting the values of `endDate1` and `endDate2`, noting that the `Date()` constructor in JavaScript uses the following format `YYYY-[0-11]-[1-31]-[0-23]-[0-59]-[0-59]`. You chose which nights each auction is visible on by adding its number to the `firstNight` or `secondNight` arrays. If you add an auction number to both nights then users will be able to bid on the same item on both nights with the auction ending at the end time of the second night.

### Compiling JavaScript and CSS
In order to deal with any side effects and increase website performance all of the JavaScript and SCSS is concatenated/compiled into minified JavaScript and CSS files respectively. This is done for you automatically using `gulp`
```
cd /path/to/auction-website
gulp build
# or using the npm alias
# npm run build
```

### Hosting development server
For development you can also use `gulp` to locally host a server that dynamically compiles minified code as you write it, helping you to make small JavaSript or CSS changes and see immediate results.
```
cd /path/to/auction-website
gulp watch
# or using the npm alias
# npm run watch
```

### Firebase setup
Here we will cover how to set up your Firebase project and then how to enable the Firebase authentication and database respectively.

#### Creating a project
You can create a project using the following steps:
- Head to the [Firebase website](https://console.firebase.google.com/) where you can manage your projects.
- Click `Add project` and choose your project's name.
- Then you may enable or disable Google Analytics at your discretion.
- You will then be taken to your project's console (https://console.firebase.google.com/project/your-project-name/overview) where you will add a web app to your project by clicking on the relevant button and chosing a name for the app (this is arbitrary and only to identify your app within the project if, for example, you had multiple apps).
- Now that you have created an app you should be shown a code snipped containing `firebaseConfig`. Copy everything inside `firebaseConfig` to the `firebaseConfig` variable in `index.html`.
- Finally you will want to update the version of the Firebase SDKs that are imported after [line 26 of `index.html`](https://github.com/HMellor/auction-website/blob/d7c5ff9b5d1cc19717e4a36801a9039055ac4078/index.html#L26). The most recent version will be shown in the script tag above `firebaseConfig` when you create your project.

(The code snippet containing `firebaseConfig` and the current version can be found in general project settings if you missed it earlier)

#### Authentication
Setting up authentication is very simple. Head to your project's console and click on Authentication in the menu on the left. Then go to the Sign-in method tab and enable toggle switch for the Anonymous sign-in provider.

#### Database
Setting up the database is a little more involved so here are the steps you must take:
- Head to your project's console and click on Database in the menu on the left. Then click on `Create database` (the mode you start in does not matter because we are about to set proper rules anyway).
- Then chose which region you want your Firestore to be stored (check the server locations [here](https://firebase.google.com/docs/firestore/locations) if there are multiple in your region).
- Head to the `Rules` tab and paste the rules below.
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  	function isAdmin() {
    	return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == "insert long random secret string"
    }
    function isDocumentOverWrite() {
    	return request.resource.data.keys().hasOnly(resource.data.keys())
    }
    function isFieldOverWrite() {
    	return request.resource.data[request.resource.data.keys()[0]].keys().hasOnly(resource.data[request.resource.data.keys()[0]].keys())
    }
    function isLoggedIn() {
    	return exists(/databases/$(database)/documents/users/$(request.auth.uid))
    }
  	match /users/{user} {
    	allow read, update, delete: if false;
    	allow create: if true;
    }
    match /auction-live/{items} {
      allow get, list: if true;
    	allow create, delete: if isAdmin();
      allow update: if isAdmin() || isLoggedIn(); //&& !isFieldOverWrite();
    }
    match /auction-store/{item} {
      allow get, list: if false;
    	allow create, delete: if isAdmin();
      allow update: if isAdmin() || isLoggedIn() && !isDocumentOverWrite();
    }
  }
}
```
- These rules state that:
  - Users (admin or otherwise) can only create user documents, ensuring that no one but you can see the users names (a privacy measure).
  - The auction live  document may be read by anyone and only updated if the user is logged in (or if the user is an admin). This document is what your clients will fetch the current state of the auction from. Therefore no real names are stored here, only the bid amount and the user's UID (which is randomly generated by Firebase and is completely non-identifying to any prying eyes).
  - The auction store documents may not be read by anyone and only be written to if the user is logged in and the requested write would not overwrite any previous bids (or if the user is an admin). These documents serve as both a backup copy of the auction that cannot be meddled with and a directory of bid information containing user names for your eyes only.
- You may notice that the `isFieldOverWrite()` call for the `auction-live` rule is commented out. This is because it only works for a single auction and thus, in its current state, would be fatal to implement in the auction. If you are able to make it work correctly I would appreciate it if you let me know your solution either in a pull request or in a comment on the [relevant issue](https://github.com/HMellor/auction-website/issues/5).

### Creating an admin account and initialising your auctions
The final step in setting up your auction is to create an admin account and use it to initialise your auctions.

To create an admin account:
- Host your website either locally using `gulp` or on GitHub Pages and log in to your website.
- Then go to your Firestore console and find the document for the user you just created.
- There should be a field in the document called `admin` which has the value `"false"`. You must now create a password (or hash) that enables admin access and set the `admin` field to this value.
- With your admin password chosen, go to your Firestore rules and replace `"insert long random secret string"` with it.
- You have now created your admin account.

To initialise the auctions:
- With the device you used to create your admin account, head to your website.
- Open the developer console (F12) and type the following into the console at the bottom:
```
resetAll()
```
- This will wipe all documents in the `auction-live` and `auction-store` collections and create auctions with the titles, info and reserve prices you defined earlier (as long as you are admin).
- Your auction is now ready for your event.
