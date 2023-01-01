Here's the rough summary of the app:

At first, we are sending data from signup page to backend to save user in mongoDB.
After saving, user will be able to sign in through website login page. 
The default role of registered user is Patron but user can update it to artist anytime after login.
User will be able to upload his art work through upload page (user must be an artist to use this feature)
User can write reviews about different arts and like them. (If the user is an artist, he'll not be able to like, review his own work)
User can follow the artist or see details
User can see the artists list which he's following from top navbar after logging in
User can unfollow them
User can only have a single account in a browser
Logged in user can't access the login/signup page (He must be sign out for this)
Non logged in user can's access any page except login or signup


added that function in routes/users.js lines 401 to 427 and commented out those lines. You can uncomment them and replace the arrayToUpload
variable with the data you wanna upload and when you hit /upload-static-data route from the browser, it will be uploaded to DB.

