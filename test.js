const focusrite = require('./main');

// focusrite.createFakeServer([
//   `<client-details id="XXXXXXXXX"/>`,
//   `<device-arrival>...</device-arrival>`,
// ], (data) => {
//   console.log(data);
// });

focusrite.findServerPort((port) => {
  const config = {
    airmode: null,
    instmode: null,
  };

  focusrite.createFakeClient(port, 'xxxxxxxx-0000-xxxx-xxxx-xxxxxxxxxxxx', (onData, clientWrite) => {
    onData((data) => {
      let airmode = data.toString().match(/id="23" value\=\"([truefals]*)\"/);
      let instmode = data.toString().match(/id="28" value\=\"([LineInst]*)\"/);

      if (airmode && config.airmode !== airmode[1]) {
        config.airmode = airmode[1];
        console.log(`Airmode was set to : ${config.airmode}`);
      }

      if (instmode && config.instmode !== instmode[1]) {
        config.instmode = instmode[1];
        if (config.instmode === 'Inst') {
          clientWrite(focusrite.requests.MODE_NORMAL);
          clientWrite(focusrite.requests.MODE_COLOR);
          changeColor();
        }else clientWrite(focusrite.requests.MODE_NORMAL);
      }
    });

    let i = 0;
    let reverse = false;
    function changeColor() {
      if (config.instmode !== 'Inst') return;
      if (reverse) i--;
      else i++;
      let rq = focusrite.colors.fromIndex(i);
      if (!rq) {
        // reverse = !reverse;
        // if (reverse) i -= 2;
        // else i += 2;
        i = 0;
        rq = focusrite.colors.fromIndex(i);
      }
      clientWrite(rq);
      if (config.instmode === 'Inst') setTimeout(changeColor, 70);
    }

    Object.prototype.fromIndex = function(i) {
      const keys = Object.keys(this);
      return this[keys[i]];
    }
  });
});
