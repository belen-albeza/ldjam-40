module.exports = {
    makeImage: function (game, width, height, color) {
        let rect = game.make.bitmapData(width, height);
        rect.ctx.fillStyle = color;
        rect.ctx.fillRect(0, 0, width, height);
        return rect;
    }
}
