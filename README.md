# Shirt Stretch Issue

I believe the issue is related to the scalex and scaley that is being set on the images and/or stage.

In this example, scalex and scaley are only set to the stage as part of the `fitStageIntoParentContainer()` function, which executes on window resize (and in some other places). In this function, scalex and scaley are always the same, 1:1.

This page is live, here:

