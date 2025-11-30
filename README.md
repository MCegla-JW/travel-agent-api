# Travel Agent App 

Description

A full stack single-page application that allows users to plan their dream trips and add activities to each one. If users need inspiration, they can utilise the built-in AI assistant to generate a personalised list of activity ideas. 

*This app has two repositories: frontend and backend

Code snippets in this ReadMe are from backend, for frontend, please go here - [Frontend ReadMe](https://github.com/MCegla-JW/travel-agent)

# Deployment Link 

🏝️The App: [Travel Agent](https://travel-agent-ten-nu.vercel.app/)

# Timeframe & Working Team 

## Collaborators:
- Cornelius Lejeune

This was a paired project and my first time collaborating extensively using Git. The application uses React in the front end and Node.js with Express.js and MongoDB Atlas on the back end. We also used Postman to support API testing during development.

## Timeframe: 1 week

| Time | Task 
|:-----| :-----
| Days 1-2 | Planning (theme, user stories, ERD, wireframes, Trello board set up)
| Days 3 | Core CRUD functionality and authentication 
| Day 4-5 | Error Handling and AI feature integration 
| Day 6 | Styling and responsive design
| Day 7 | Testing, bug fixes, deployment, ReadMe

# Technologies Used

## Frontend:

- React 
- Material UI 
- HTML5
- JSX
- React Router

## Backend: 

- Node.js
- npm
- Express.js
- MongoDB Atlas 
- mongoose 
- bcrypt
- JSON Web Tokens (JWT)
- OpenAI API
- axios

## Development & Design Tools:

- Miro
- Trello 
- Postman (API testing)
- VSCode

## Deployment: 

- Heroku (server)
- Vercel (client)

## Version Control:

- Git 
- GitHub

## Features 

- User Authentication: Secure sign-up, sign-in and sign-out functionality using a JSON Web Token
- AI Assistant: Uses AI to generate personalised activity recommendations based on the user’s destination 
- CRUD Operations: Create, read, update and delete trips 
- Authorization: Protected routes ensure that only authenticated users can access the create, edit and delete content
- Responsive Design: Mobile-first design 
- Error Handling & Validation:  Server-side and client-side validation to prevent invalid data submission
- Environment Variable Security: Sensitive keys managed through .env files

## Brief

The project requirements included:

- The back-end application is built with Express and Node.
- The front-end application is built with React.
- MongoDB is used as the database management system.
- The back-end and front-end applications implement JWT token-based authentication to sign up, sign in, and sign out users.
- Authorization is implemented across the front-end and back-end. Guest users (those not signed in) should not be able to create, update, or delete data in the application or access functionality allowing those actions.
- The project has at least two data entities in addition to the User model. At least one entity must have a relationship with the User model.
- The project has full CRUD functionality on both the back-end and front-end.
- The front-end application does not hold any secret keys. Public APIs that require secret keys must be accessed from the back-end application.
- The project is deployed online so that the rest of the world can use it.

# Planning

- Theme: The planning phase started with individual theme research. My partner and I met to discuss our ideas and to decide which theme to go with. We decided to go mobile first from the start.
- ERD: I took on the Entity Relationship Diagram (ERD) creation to visualise the relationships between the User, Trip and Activity models
- Wireframes: My partner created the wireframes to outline the user journey and overall flow of the app
- Routing Table: I created the routing table to define the routes required for the single-page application
- Project Management: I set up the Trello board for task management 
- Project Set-up: My partner created the GitHub repositories and handled the initial project configuration
- ESlint - we both installed and configured ESLint to ensure our code followed consistent styling and best practices
- Task Delegation: We split the tasks so we each got a chance to work on both the front and the back end 

## Approach taken:
 
- At the start of each day, we had a stand up meeting to review our progress and run through the tasks to be done that day.

- We used GitHub to collaborate and manage version control. Each of us created feature branches from the main branch submitted pull requests before merging. We notified each other whenever a new PR was ready so we could review it in a timely manner to prevent either of us from being blocked. This workload helped us to keep main up to date and ensured we were always working on the latest version of the code. Thanks to this approach, we experienced no merge conflicts throughout the project.

# My Work

## My personal achievements are: 

- Coming up with the project theme 
- Created the user Schema (used schema hooks to validate password) 
- Developed backend login and register routes using JSON Web Token 
- Implemented authentication on both backend and frontend
- Set up the homepage on backend and frontend including the marketing content with React Slick carousel
- Implemented React Slick carousel in the TripIndex file 
- Created the boilerplate code for both backend (established server and database connections) and frontend to establish project structure 
- Developed a NotFound component for handling unknown routes
- Implemented error handling for both frontend and backend
- Built the NavBar component for the frontend, sourced the logo 
- Styled the app using Material UI for consistent and responsive design 
- Created a date conversion service function to handle form inputs and display dates in a user-friendly format on the frontend edit page

# Build/Code Process

## Created the user Schema (used schema hooks to validate password)

I added a virtual confirmPassword field to temporarily store the confirmation password. This will not be saved in the database. 

```js
userSchema.virtual('confirmPassword').set(function (passwordValue) {
  this._confirmPassword = passwordValue
})
```
I then used a pre-validate hook to ensure the password and confirmPassword match.

```js
userSchema.pre('validate', function () {
  if (this.isModified('password') && this.password !== this._confirmPassword) {
    this.invalidate('confirmPassword', 'Passwords do not match')
  }
})
```
I then used a pre-save hook to hash the password before saving to MongoDB. 

```js
userSchema.pre('save', function () {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 12)
  }
})
```
Finally I used toJSON to remove the password from response for security. 

```js
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        return ret
      },
    },
  },
)
```

## Developed backend login and register routes using JSON Web Token and implemented authentication on both backend and frontend

I created custom middleware (isSignedIn) for handling the authentication. This middleware is responsible for checking if the user request contains an Authorisation Header and throws a custom Unauthorised error if not. It then checks if a token is included and also throws a custom Unauthorised error if not. If there is a token, it verifies if the token is valid and then takes it, decodes it and uses it to check of the user exists in the database. If the token is not valid, it throws Unauthorized, and if the user does not exists it throws NotFound. It then attaches the user object to req.user and calls next() to proceed to the next middleware/route.

```js
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import { Unauthorized, NotFound } from '../utils/errors.js'

const isSignedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) throw new Unauthorized('No auth header found')
    const token = authHeader.split(' ')[1]
    if (!token) throw new Unauthorized('Payload missing')
    const decodedPayload = jwt.verify(token, process.env.TOKEN_SECRET)
    const user = await User.findById(decodedPayload.user._id)
    if (!user) throw new NotFound('User not found in database')
    req.user = user
    next()
  } catch (error) {
    console.log(error.message)
    if (error.name === 'JsonWebTokenError')
      return next(new Unauthorized('Invalid token'))
    if (error.name === 'TokenExpiredError')
      return next(new Unauthorized('Token expired'))
    next(error)
  }
}

export default isSignedIn
```

## Implemented error handling for both frontend and backend

The errorHandler function and custom error classes were a joint effort. My partner provided the initial boilerplate for errors.js and errorHandler. I extended the functionality to include:
- detailed backend logging - to help developers debug easily 
- formatted frontend messaging using a payload to make sure the console and client always understand the status and message. 

I followed good UI principles to make sure the user receives a clear and actionable error response.

```js
const errorHandler = (error, req, res, next) => {
  const backendDetails = {
    status: error.status || 500,
    code: error.code || 0,
    name: error.name || 'Generic internal server error',
    description: error.description || 'Something went wrong',
    request: `${req.method} ${req.url}`,
    repair: error.repair || 'Unknown',
    timestamp: new Date(Date.now()).toISOString(),
  }

  // Unique constraint (from Mongoose if a value is passed to the schema that must be unique)
  if (error.code === 11000) {
    backendDetails.status = 400
    backendDetails.code = 1
    backendDetails.name = 'Value not unique'
    backendDetails.description =
      'Duplicate value provided for a field that must be unique'
    backendDetails.repair = 'Provide a different value'
  }

  // Cast Error (from Express if the route cannot be cast)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    backendDetails.status = 404
    backendDetails.code = 2
    backendDetails.name = 'Not found'
    backendDetails.description = 'The requested resource could not be located.'
    backendDetails.repair =
      'Verify that the resource identifier is correct. If the resource does not exist, create it before retrying.'
  }

  // Validation Error (from Mongoose if invalid date is passed to the schema)
  if (error.name === 'ValidationError') {
    backendDetails.status = 400
    backendDetails.code = 3
    backendDetails.name = 'Invalid data'
    backendDetails.description = 'Data provided is invalid for the resource.'
    backendDetails.repair =
      'Ensure that all values meet the resource schema definition.'
  }

  let frontendMessage = {}

  if (error.payload) {
    if (typeof error.payload === 'object' && !error.payload.message) {
      frontendMessage = error.payload
    } else if (error.payload.message) {
      frontendMessage = { message: error.payload.message }
    } else if (typeof error.payload === 'string') {
      frontendMessage = { message: error.payload}
    }
  } else {
    frontendMessage = { message: error.message || 'An error occured'}
  }
  // Nice error formatting for production use, not enough detail during development
  // logError(message)
  console.error(backendDetails)
  return res.status(backendDetails.status).json({
    frontend: frontendMessage,
    backend: backendDetails
  })

}

export default errorHandler
```

## Screenshots
TBC

## Challenges 

- No notable team challenges to report.
- Learning the difference between front-end (React) and back-end(Node.js, Express) and how they communicate.
- useContext and userContext took some time to understand but I improved my knowledge of them through extensive use in this project.

## Wins

- OpenAI Integration – I’m very pleased we successfully integrated AI into this project, as I believe it is becoming a standard feature in many modern applications.
- Working effectively in a team, communicating well, and avoiding merge conflicts.
- Successfully creating a fully RESTful API.
- Using a new library for styling – I learned Material UI and implemented it effectively in the project, which helped ensure consistent styling and responsiveness across the app.

## Key Learnings/Takeaways

- I really enjoyed collaborating with my partner on GitHub, it gave me a real-life example of how developers work together in a professional environment.
- Using Git and GitHub extensively during this project improved my knowledge and confidence in version control.
- Learning Material UI took me about half a day, but I was able to implement it quickly. I enjoyed using it because it helped ensure consistent styling across the app and made it easier to create a responsive design compared to plain CSS.
- My partner was responsible for implementing the AI functionality, but he walked me through the code step by step. I now have a much better understanding of it and feel confident that I can implement similar features in my future projects.
- Learning React and using a wide range of packages for it that I have never used before 
Deployment using Heroku and Vercel.

## Known Bugs

- Not a bug but the AI does take about 20s to generate a response as we are using the cheapest model.

## Future Improvements 

- Dark/Light mode
- Users can set a background photo for trip cards or at lest adjust coolers themselves 
- Connect to third party API to source weather data in each trip destination and display it for users 
- User can edit and delete their profile - I have a featured branch started for this but I need to do more research on profile deletion 
- Use toastify for more interesting error messaging on front end 
- Improve styling on AI feature - add a loading gif/icon as it takes a while to generate results 

## Installation & Setup

1. Clone the repo
-git clone https://github.com/MCegla-JW/travel-agent-api

2. Install dependencies
- npm install

3. Create .env file with the following variables:
- MONGODB_URI=<your-mongodb-connection-string>
- PORT=3000
- DEPLOYED_FRONTEND_URL=https://travel-agent-ten-nu.vercel.app
- OPENAI_API_KEY=<your-key>
  
4. Start the development server
- npm run dev
