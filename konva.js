/**
 * Instantiate the canvas for the first time 
 * @param {Array} size - The size of the rectangle, represented as [w, h].
 * @return {Array} The Stage and initial Layer as an Array [Stage, Layer]
 */
const kAddStage = (w, h) => {
    //#region Add a stage to Konva
    // Set the stage 
    const stage = new Konva.Stage({
        container: 'canvas',
        width: w,
        height: h,
    });
    const layer = new Konva.Layer();
    stage.add(layer)
    return [stage, layer];
    //#endregion
}

/**
 * Insert a rectangle into the canvas
 * @param {Layer} layer - A canvas layer to add the rectangle to 
 * @param {Object} rectangleProps - Properties to apply to the rectangle 
 * @returns {Rectangle} The newly created rectangle
 */
const kAddRect = (layer, rectangleProps) => {
    //#region Add a rectangle to Konva
    let rect = new Konva.Rect(rectangleProps)
    layer.add(rect)
    return rect
    //#endregion
}

/**
 * Insert a rectangle into the canvas
 * @param {Layer} layer - A canvas layer to add the rectangle to 
 * @param {String} url - The url to use for the image
 * @param {Object} imageProps - Properties to apply to the image
 * @param {Layer} layer - A canvas Layer to attach the shape to.
 * @returns {Rectangle} The newly created rectangle
 */
const kAddImage = (layer, url, imageProps) => {
    //#region Add an Image to Konva. Returns promise 
    return new Promise((resolve, reject) => {
        var imageObj = new Image();
        imageObj.onload = function() {
            var imageData = new Konva.Image({
                ...imageProps,
                image: imageObj
            });

            // add the shape to the layer
            layer.add(imageData);
            resolve(imageData)
        };
        imageObj.src = url;
        imageObj.onerror = () => {
            reject("Failed to load image.")
        }
    })
    //#endregion
}

/**
 * Fits the stage to it's container div
 * @param {String} containerDiv - A CSS selector pointing to the canvas's div
    *
 */
// https://konvajs.org/docs/sandbox/Responsive_Canvas.html

export { kAddStage, kAddRect, kAddImage }
