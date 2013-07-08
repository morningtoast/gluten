Gluten.js
======

Use Gluten lets you easily define and switch between bindings on the same element within different break points. On resize, Gluten will detach and attach events based on your preferred breakpoints.

### Contributors
* Brian Vaughn, @morningtoast
* Brad Walker, @bwalker8038

## Todo
* Remove jQuery dependcies
* More/better docs


## Dependencies
As of this moment, Gluten requires jQuery for event bindings.

## Usage
To initalize the library, pass your breakpoints to `Gluten.init()` like
the following:

    Gluten.init({
        small: 400,
        medium: 800,
        foo: 1024
    });

Once the breakpoints are set, define your events using `Gluten.rules()`. The events are defined as object in the following manner:

    Gluten.rules([
        {
            selector: "#foo",
            event: "click.foo",
            sizes: "small,medium,foo",
            callback: function() {
                alert('bar');
            }
        }
    ]);

To initialized the window resize listener call `Gluten.refresh()`.
From here, your events will fire at the given breakpoints on window resize.
