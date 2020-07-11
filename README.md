# Focusrite Control API
 Focusrite Control API

 No dependencies 💪

___
## Installation

```
npm install focusrite
```

## Examples (test.js)

 Start by importing the library
 ```javascript
 const focusrite = require('focusrite');
 ```

### Create a fake ControlServer
```javascript
focusrite.createFakeServer([
    `<client-details id="XXXXXXXXX"/>`,
    `<device-arrival> ... </device-arrival>`,
    ...
], (data) => {
    console.log(data);
});
```

### Find the running ControlServer port
```javascript
focusrite.findServerPort((port) => {
    console.log(`ControlServer port is : ${port}`);
});
```

### Connect to the ControlServer as a fake client
```javascript
focusrite.createFakeClient(port, 'xxxxxxxx-0000-xxxx-xxxx-xxxxxxxxxxxx', (onData, clientWrite) => {
    onData((data) => {
        console.log(data);

        // These commands are compatible with the Scarlett SOLO (3rd gen) :

        // To write a response
        clientWrite(`<set devid="1"> ... </set>`);

        // To change gain halos colors
        clientWrite(focusrite.requests.MODE_COLOR); // First set in "color" mode
        clientWrite(focusrite.colors.RED); // Availables colors : RED, AMBER, GREEN, LIGHT_BLUE, BLUE, LIGHT_PINK, PINK

        // To enable/disable AIR Mode
        clientWrite(focusrite.requests.A1_PREAMP_TRUE); // Enable
        clientWrite(focusrite.requests.A1_PREAMP_FALSE); // Disable

        // To enable/disable INST Mode
        clientWrite(focusrite.requests.A2_INST_TRUE); // Enable
        clientWrite(focusrite.requests.A2_INST_FALSE); // Disable
        
        // To send a custom command
        clientWrite(`<set devid="..."> ... </set>`);

        // Model of a command :
        /*
        <set devid="{ Device ID (ex: "1") }">
            <item
                id="{ Parameter ID (ex: "44" to change the color) }"
                value="{ Parameter value (ex: "red" to change the color) }"
            />
        </set>
        */
    });
});
```

___
## Problems

 If you have errors in console or unwanted behavior, just reload the page.
 If the problem persists, please create an issue [here](https://github.com/Mathieu2301/Focusrite-Control-API/issues).
