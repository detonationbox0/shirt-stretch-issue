// HELPER KONVA FUNCTIONS
import { kAddStage, kAddRect, kAddImage } from './konva.js'

// LOAD PRODUCT INFORMATION
import productData from './products.js'

// GLOBAL VARIABLES
let palletWidth, palletHeight;
let canvasWidth, canvasHeight;

let stage, layer;

let defaultRect;
let currentProduct;

let images = [];

$(async () => {
    //#region On Load

    // Get selected item
    const selItem = $("#pallets").find("option:selected").text()

    // Go and get this product image
    await downloadImage(selItem);

    console.log(selItem)
    loadProduct(selItem)

    // Grab the canvas's Width (which is dynamic)
    canvasWidth = $("#canvas").width()

    // Calculate the proper height to match pallet
    canvasHeight = (palletHeight * canvasWidth) / palletWidth
    $("#canvas").height(canvasHeight);

    [stage, layer] = kAddStage(canvasWidth, canvasHeight);
    createDefaultRect();

    fitStageIntoParentContainer();

    // Go and download all of the the product images
    await downloadImages();

    //#endregion
})


// JQUERY ON EVENTS:
//#region $().on() DOM Change Events
$("#width").on("input", () => {
    const newWidth = $("#width").val()
    $("#canvas").width(`${newWidth}%`)
    fitStageIntoParentContainer()
})

$("#left").on("input", () => {
    const newPos = $("#left").val()
    $("#canvas").css("left", `${newPos}%`)
    fitStageIntoParentContainer()
})

$("#top").on("input", () => {
    const newPos = $("#top").val()
    $("#canvas").css("top", `${newPos}%`)
    fitStageIntoParentContainer()
})

$("#dwidth").on("input", () => {
    const newWidth = Number($("#dwidth").val()) * .01; // %
    canvasWidth = $("#canvas").width();
    defaultRect.width(canvasWidth * newWidth)
    console.log(canvasWidth * newWidth)
    fitStageIntoParentContainer()
})

$("#dheight").on("input", () => {
    const newHeight = Number($("#dheight").val()) * .01; // %
    canvasHeight = $("#canvas").height();
    defaultRect.height(canvasHeight * newHeight)
    console.log("Resize the default box here...")
    fitStageIntoParentContainer()
})

$("#dleft").on("input", () => {
    const newLeft = Number($("#dleft").val()) * .01;
    canvasWidth = $("#canvas").width();
    console.log(canvasWidth * newLeft)
    defaultRect.x(canvasWidth * newLeft)
    console.log("Move from left the default box here...")
    fitStageIntoParentContainer()
})

$("#dtop").on("input", () => {
    const newTop = Number($("#dtop").val()) * .01;
    canvasHeight = $("#canvas").height();
    console.log(canvasHeight * newTop)
    defaultRect.y(canvasHeight * newTop)
    console.log("Move from top the default box here...")
    fitStageIntoParentContainer()
})

$("#pallets").on("change", function() {
    console.log("Deleting ", images)
    images.forEach(img => img.destroy())
    loadProduct($(this).val());
    createDefaultRect();
    fitStageIntoParentContainer();
});

$("#add-default").on("click", () => {
    //#region

    console.log("Deleting ", images)
    images.forEach(img => img.destroy())

    // Add the image to the space where the defaultRectangle is
    // Centers the image within the space as well

    // Get the size of the default rectangle 
    let defaultRectWidth = defaultRect.width()
    let defaultRectHeight = defaultRect.height()

    // Get the position of the default rectangle
    let defaultRectX = defaultRect.x()
    let defaultRectY = defaultRect.y()

    // Temporarily load the original image so we can get it's width and height
    kAddImage(layer,
        './15140_500x500.jpg',
        {
            x: 0,
            y: 0
        }
    ).then((imageObj) => { // It takes a few milliseconds to load

        // Get the width and height of the original image
        // then destroy it
        let ogImageWidth = imageObj.width();
        let ogImageHeight = imageObj.height();
        imageObj.destroy()

        // Fit the size of the original image into the size
        // of the default logo box
        let clampedSize = clamp(
            ogImageWidth,       // w1
            ogImageHeight,       // h1
            defaultRectWidth, // w2
            defaultRectHeight  // h2
        )

        // Add the image, positioned to center of default rectangle
        return kAddImage(layer,
            './15140_500x500.jpg',
            {
                // let x = (w1 - w2) / 2;
                x: defaultRectX + ((defaultRectWidth - clampedSize[0]) / 2),
                y: defaultRectY + ((defaultRectHeight - clampedSize[1]) / 2),
                width: clampedSize[0],
                height: clampedSize[1],
                draggable: true
            }
        )

    }).then((img) => {
        images.push(img);
    })
    //#endregion
})

$("#add-image").on("click", () => {
    //#region Add a random image.
    // Insert image, get height width
    kAddImage(layer, "./1000x500.jpg", {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        draggable: true
    }).then((img) => {

        // Get the image's original width and height
        let imgWidth = img.width()
        let imgHeight = img.height()


        let x = (canvasWidth - imgWidth) / 2;
        let y = (canvasHeight - imgHeight) / 2;

        img.x(x);
        img.y(y)
    })
    //#endregion
})

$("#download").on("click", () => {
    var dataURL = stage.toDataURL({ pixelRatio: 3 });
    downloadURI(dataURL, 'stage.png');
})

//#endregion

// LOAD PRODUCT:
function loadProduct(product) {
    //#region Load a product
    currentProduct = productData[product];

    // Set the pallet sizes
    let pal = currentProduct.pallet
    let cnv = currentProduct.canvas;

    // Set pallets globally
    palletWidth = pal.w;
    palletHeight = pal.h

    // Update DOM
    $("#width").val(cnv.w);
    $("#left").val(cnv.l);
    $("#top").val(cnv.t);

    // Set default DOM values
    let def = currentProduct.default;
    $("#dwidth").val(def.w);
    $("#dheight").val(def.h);
    $("#dleft").val(def.l);
    $("#dtop").val(def.t);

    // Set canvas div up
    $("#canvas").width(`${cnv.w}%`);
    $("#canvas").css('left', `${cnv.l}%`)
    $("#canvas").css('top', `${cnv.t}%`)

    // Get the new canvas width and height
    // try to set the canvas width and height to match new pallet
    // if it fails, the stage has not been created yet, and continue
    let nCanvasWidth = $("#canvas").width()
    let nCanvasHeight = (palletHeight * nCanvasWidth) / palletWidth;
    // Set the div height
    $("#canvas").height(nCanvasHeight)
    // let nCanvasScale = { x: 1, y: 1 };
    try {
        stage.width(nCanvasWidth);
        stage.height(nCanvasHeight);
        // stage.scale(nCanvasScale)
        console.log(`Set stage width to ${nCanvasWidth}, stage height to ${nCanvasHeight}`)
    } catch (e) {
        console.log("Something went wrong setting the stage up...", e)
    }

    // Override globals with new canvas width and heights
    canvasWidth = nCanvasWidth
    canvasHeight = nCanvasHeight


    // Set the background image
    $("#productImage").attr("src", currentProduct.image)

    //#endregion
}

// FIT STAGE TO CONTAINER:
window.addEventListener('resize', fitStageIntoParentContainer);
function fitStageIntoParentContainer() {
    //#region Fit Stage Into Parent Container

    // Set height to 4:3
    const pixelWidth = $("#canvas").width()
    const pixelHeight = (palletHeight * pixelWidth) / palletWidth;

    $("#canvas").height(pixelHeight)

    // but we also make the full scene visible
    // so we need to scale all objects on canvas
    var scalex = pixelWidth / canvasWidth;
    var scaley = pixelHeight / canvasHeight;

    console.log("Setting stage width to", canvasWidth * scalex);
    console.log("Setting stage height to", canvasHeight * scaley);

    // Set width and height
    stage.width(canvasWidth * scalex);
    stage.height(canvasHeight * scaley);

    // Show scale in DOM
    $("#info").text(`Stage Scale X: ${scalex}, Stage Scale Y: ${scaley}`)

    // Scale the stage to match adjusted width
    stage.scale({ x: scalex, y: scaley });
    //#endregion
}

// CREATE DEFAULT RECTANGLE:
function createDefaultRect() {
    //#region Create default rectangle
    console.log("Creating a default logo at:", currentProduct.default)

    try {
        defaultRect.destroy();
    } catch (e) {
        console.log("Could not find default rect.", e)
    }

    // Calculate the width and height based on the % Width, Left and Top values
    const dWidth = currentProduct.default.w * .01; // %
    const dHeight = currentProduct.default.h * .01; // %
    const dLeft = currentProduct.default.l * .01; // %
    const dTop = currentProduct.default.t * .01; // %
    const dx = canvasWidth * dLeft;
    const dy = canvasHeight * dTop;
    const dw = canvasWidth * dWidth;
    const dh = canvasHeight * dHeight;

    // Add the default rectangle shape
    defaultRect = kAddRect(layer, {
        x: dx,
        y: dy,
        width: dw,
        height: dh,
        stroke: 'black',
        strokeWidth: 1,
        // draggable: true
    });
    //#endregion
}

// CLAMP FUNCTION:
function clamp(w1, h1, w2, h2) {
    // #region Clamp 
    // Fits one width,height into another larger one.
    // Calculate the aspect ratio of the original rectangle
    let aspectRatio = w1 / h1;
    // Initialize the width and height of the scaled rectangle
    let w3, h3;
    // If the aspect ratio of the original rectangle is greater than or equal to the aspect ratio of the target rectangle
    if (aspectRatio >= w2 / h2) {
        // Set the width of the scaled rectangle to the width of the target rectangle
        w3 = w2;
        // Set the height of the scaled rectangle to the width of the target rectangle divided by the aspect ratio
        h3 = w2 / aspectRatio;
    } else {
        // Set the height of the scaled rectangle to the height of the target rectangle
        h3 = h2;
        // Set the width of the scaled rectangle to the height of the target rectangle multiplied by the aspect ratio
        w3 = h2 * aspectRatio;
        //* Loads the given product.
        // Return the width and height of the scaled rectangle
        return [w3, h3]; //#endregion
    }
}

// DOWNLOAD AN IMAGE, WAIT FOR LOAD
function downloadImage(selectedItem) {
    return new Promise((resolve, reject) => {
        try {
            var img = new Image();
            img.onload = function() { resolve(true) }
            img.src = productData[selectedItem].image;
        } catch (e) {
            reject(e)
        }
    })
}

// DOWNLOAD IMAGES QUICK:
async function downloadImages() {
    for (const prod in productData) {
        $("body").append(`
            <img src="${productData[prod].image}" style="display: none;" />
        `)
    }
}

function downloadURI(uri, name) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link = null;
}
