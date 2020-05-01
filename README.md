# Discord-bot

A simple discord bot which helps you manage your server by providing useful commands like playing music or deleting text messages.

## Features

- Userinfo
- Play music
- Skip songs
- Stop music
- Loop music

## Requirements

- [Node](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)
- [FFMPEG](https://www.ffmpeg.org/)
- [Docker](https://www.docker.com/) (optional)

## Getting started

First make sure you have all the required tools installed on your local machine then continue with these steps.

### Installation

```bash
# Clone the repository
git clone https://github.com/JerryJHC/discordbot.git

# Enter into the directory
cd discord-bot/

# Install the dependencies
npm install
```

### Configuration

After cloning the project and installing all dependencies you need to add your Discord API token in the config.json file.

### Starting the application

```bash
node index.js
```

### Starting the application using Docker

```bash
# Build the image
docker build --tag discordbot .

# Run the image
docker run -d discordbot

# RUn the image personalized
docker run -d --restart unless-stopped --name TinyBot discordbot

```

## Author

Jerry Henríquez

## Original Project

#### Author Gabriel Tanner
https://github.com/TannerGabriel/discord-bot

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
