var html =`
<li>
<strong>A network administrator is planning an IOS upgrade on several of the head office routers and switches. Which three questions must be answered before continuing with the IOS selection and upgrade? (Choose three.)</strong><ul>
<li>Are the devices on the same LAN?</li><li>Do the devices have enough NVRAM to store the IOS image?</li>
<li><span style="color: #ff0000;">What models of routers and switches require upgrades?</span></li><li>What ports are installed on the routers and switches?</li><li><span style="color: #ff0000;">Do the routers and switches have enough RAM and flash memory for the proposed IOS versions? </span></li><li><span style="color: #ff0000;">What features are required for the devices?</span></li></ul></li>`

var cheerio = require("cheerio")


var $=cheerio.load(html)

console.log($('span[style="color: #ff0000;"]').text())