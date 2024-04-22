# PinSightful : AI Research Pinboard

This project is a research pinboard application built with Next.js frontend and Express.js at backend. It provides a platform for users harness the power of AI to discover and save research, articles, and other resources. The application uses the Ollama API for local LLM or OpenAI API for remote LLM to provide concise summaries by extraction realtime information from the web, wikipedia, and other sources.

## Project Structure

The project is a monorepo divided into two main parts:

-   `backend/`: This directory contains the server-side code for the application, including the main server script (`index.js`), the database model (`model.js`), and the MongoDB connection script (`mongodb.js`).
-   `frontend/`: This directory contains the client-side code for the application, built with Next.js. It includes various components, hooks, and utility functions to connect to the server and AI models.

## Key Features

-   **User Authentication**: Users can sign up, log in, and log out of the application using SSO (Single Sign-On) with Google, github, apple or email. The application uses Clerk for authentication.
-   **Research Pinboard**: Users can write, generate and save research, articles, and other resources to their pinboard.
-   **AI Summarization**: Users can generate concise summaries of topics for research using the Ollama API for local LLM or OpenAI API for remote LLM.
-   **Fully Responsive**: The application is fully responsive and works on all devices, including desktops, tablets, and mobile phones. It uses Tailwind CSS for styling , ShadCn UI for components and Acernity UI for Landing Page.

## Dependencies

The project has the following dependencies:

-   `next`: The React framework used for building the client-side application.
-   `express`: The web application framework used for building the server.
-   `mongoose`: The MongoDB object modeling tool used to manage relationships between data, provide schema validation, and translate between objects in code and the representation of those objects in MongoDB.
-   `axios`: The Promise based HTTP client for the browser and node.js.
-   `react-dom`: Serves as the entry point to the DOM and server renderers for React.
-   `react`: A JavaScript library for building user interfaces.
-   `Langchain`: A library for language processing and generation.
-   `Clerk`: A library for authentication.
-   `Tailwind CSS`: A utility-first CSS framework for styling.
-   `ShadCn UI`: A library for components.
-   `Acernity UI`: A library for Landing Page.

## Setup

To set up the project, you need to install the dependencies first. Run the following command in both the `backend/` and `next-ai-research-pinboard/` directories:

```

npm install

```

Then, go to the `backend/` directory and rename the `.example.env` file to `.env`. Update the environment variables in the `.env` file with your own MongoDb URI.

Then, go to the `frontend/` directory and rename the `.example.env.local` file to `.env.local`. Update the environment variables in the `.env.local` file with your own [Clerk]("https://clerk.com/") API keys and Backend URL after deploying the backend. (when deploying locally it is `http://localhost:5000`)

Then, you can start the server and the client-side application in development mode by running the following command in their respective directories:

```

npm run dev

```

IMPORTANT: if you are using locally hosted ollama API on web hosted frontend you need to add frontend URL to OLLAMA_ORIGINS variable for more information visit [Ollama FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server).

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
