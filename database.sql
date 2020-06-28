CREATE DATABASE discordbotTest;

USE discordbotTest;

CREATE TABLE Config(
    loopQueue BOOLEAN,
    loopSingle BOOLEAN,
    playingMessages BOOLEAN
);

INSERT INTO Config(loopQueue,loopSingle,playingMessages)
VALUES(0,0,1);