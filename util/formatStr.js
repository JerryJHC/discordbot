exports.getTime = (time) => {
    if (!("" + time).includes(':')) {
        let minutes = Math.floor(time / 60);
        let seconds = time - minutes * 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }
    return time;
}