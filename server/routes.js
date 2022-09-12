let cheerio = require('cheerio');
if (typeof (cheerio) != 'function') cheerio = require('cheerio').default;
const fetch = require('axios');
const iconv = require('iconv-lite');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
    minTime: 0
});

module.exports = app => {

    app.get('/tori/:area', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        const area = req.params.area;
        let url;
        switch (area) {
            case 'keski-suomi':
                url = "https://www.tori.fi/keski-suomi?q=&cg=0&w=1&st=g&ca=7&l=0&md=th";
                break;
            case 'varsinais-suomi':
                url = "https://www.tori.fi/varsinais-suomi?q=&cg=0&w=1&st=g&ca=16&l=0&md=th";
                break;
            case 'uusimaa':
                url = "https://www.tori.fi/uusimaa?q=&cg=0&w=1&st=g&ca=18&l=0&md=th";
                break;
            default:
                url = "https://www.tori.fi/keski-suomi?q=&cg=0&w=1&st=g&ca=7&l=0&md=th";
        }

        fetch(url, { responseType: 'arraybuffer' })
            .then(function (response) {
                const data = iconv.decode(response.data, 'ISO-8859-1');
                return data
            })
            .then(function (html) {
                const urls = [];
                //const table = Object.values(cheerio('.list_mode_thumb > a > .desc_flex > .ad-details-left > .li-title', html))
                const table = Object.values(cheerio('.list_mode_thumb > a', html))

                table.map((obj, indx) => {
                    if (indx < 5) {
                        const url = obj.attribs.href
                        const item = Object.values(cheerio('a > .desc_flex > .ad-details-left > .li-title', obj))
                        const name = item[0].children[0].data
                        if (item && obj.attribs) {
                            //console.log(item[0].children[0].data)
                            const object = {
                                "name": name,
                                "url": url
                            }
                            urls.push(object)
                        }
                    }
                })
                //console.log(urls)

                return Promise.all(urls.map(limiter.wrap((obj, indx) => {
                    return getDetails(obj)
                }))).then(function (values) {
                    //console.log(values);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(values));
                }, reason => {
                    console.error(reason.message); // Error!
                });
                return
            })
            .catch(function (err) {
                console.log('Failed to fetch page: ', err);
            });

        const getDetails = (obj) => {
            return new Promise((resolve, reject) => {
                fetch(obj.url, { responseType: 'arraybuffer' })
                    .then(function (response) {
                        const data = iconv.decode(response.data, 'ISO-8859-1');
                        return data
                    })
                    .then(function (html) {
                        const descDiv = Object.values(cheerio('.body', html))
                        if (descDiv[0].children[2]) {
                            const desc = descDiv[0].children[2].data
                            const descParsed = desc.replace(/\n+/g, ' ').trim()
                            obj.desc = descParsed
                        }
                        const image = Object.values(cheerio('#main_image', html))
                        const imageUrl = image[0].attribs.src
                        obj.image = imageUrl
                        const thumbnails = Object.values(cheerio('.thumbnails > .thumbs_on_left > #thumbs > li > span > img', html))
                        const imagesArr = [];
                        thumbnails.map((thumbnail, indx) => {
                            if (thumbnail.name == 'img') {
                                const fullImgUrl = thumbnail.attribs.src.replace("thumbs", "big");
                                imagesArr.push(fullImgUrl)
                            }
                        })
                        obj.images = imagesArr
                        resolve(obj)
                    })
                    .catch(function (err) {
                        reject(err);
                    })
            })
        };
    })

    app.get('/second/:format', function (req, res) {
        const format = req.params.format
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(format));
    })

};
