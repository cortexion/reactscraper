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
                url = "https://www.tori.fi/recommerce/forsale/search?dealer_segment=1&location=0.100007&trade_type=2";
                break;
            case 'varsinais-suomi':
                url = "https://www.tori.fi/recommerce/forsale/search?dealer_segment=1&location=0.100016&trade_type=2";
                break;
            case 'pirkanmaa':
                url = "https://www.tori.fi/recommerce/forsale/search?dealer_segment=1&location=0.100011&trade_type=2";
                break;
            default:
                url = "https://www.tori.fi/recommerce/forsale/search?dealer_segment=1&location=0.100007&trade_type=2";
        }

        fetch(url, { responseType: 'arraybuffer' })
            .then(function (response) {
                const data = iconv.decode(response.data, 'ISO-8859-1');
                return data
            })
            .then(function (html) {
                //console.log(html);
                
                const table = Object.values(cheerio('.col-span-2', html));
                

                //console.log(table[0].children[2].children[4].children);
                const articles = Object.values(cheerio('.col-span-2 > section > div:nth-of-type(4) > article', html));
                
                //console.log(articles);
                const urls = articles.map((obj, index) => {
                    if (index <= 5 && obj.name === 'article') {
                        console.log('true!')                        

                        const anchorElement = cheerio('div:nth-of-type(3) > h2 > a', obj);
                        console.log('anchorElement.length: ', anchorElement.length)
                
                        if (anchorElement.length > 0) {
                            const hrefname = anchorElement.text();
                            const hrefurl = anchorElement.attr('href');

                            
                
                            return {
                                "name": hrefname,
                                "url": hrefurl
                            };
                        } else {
                            return null;
                        }
                    } else {
                        console.log('not true!')
                        return null;
                    }                
                }).filter(url => url !== null);
                console.log('urls: ', urls);

                const urls1 = articles.reduce((acc, obj, index) => {
                    if (acc.length >= 5 || obj.name !== 'article') return acc;
                    
                    const anchorElement = cheerio('div:nth-of-type(3) > h2 > a', obj);
                
                    if (anchorElement.length > 0) {
                        const hrefname = anchorElement.text();
                        const hrefurl = anchorElement.attr('href');
                        
                        return [
                            ...acc,
                            {
                                "name": hrefname,
                                "url": hrefurl
                            }
                        ];
                    } else {
                        return acc;
                    }
                }, []);
                //console.log('urls1: ', urls1);

                const urls2 = [];
                let count = 0;
                for (const obj of articles) {
                    if (count >= 5 || obj.name !== 'article') continue;
                
                    const anchorElement = cheerio('div:nth-of-type(3) > h2 > a', obj);
                
                    if (anchorElement.length > 0) {
                        const hrefname = anchorElement.text();
                        const hrefurl = anchorElement.attr('href');
                        
                        urls2.push({
                            "name": hrefname,
                            "url": hrefurl
                        });
                        count++;
                    }
                }
                
                //console.log('urls2: ', urls2);


                Promise.all(urls.map(limiter.wrap((obj, indx) => {
                    return getDetails(obj)
                }))).then(function (values) {
                    //console.log(values);
                    //res.end(JSON.stringify('getDetails done'));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(values));
                }, reason => {
                     // Error!
                });

                const getDetails = (obj) => {
                    return new Promise((resolve, reject) => {
                        fetch(obj.url, { responseType: 'arraybuffer' })
                            .then(function (response) {
                                const data = iconv.decode(response.data, 'ISO-8859-1');
                                return data
                            })
                            .then(function (html) {
                                //console.log('html: ', html);
                                const $ = cheerio.load(html);

                                const descElement = $('div.whitespace-pre-wrap').children()[0];
                                if (descElement) {
                                    obj.desc = descElement.children[0].data;
                                } else {
                                    obj.desc = '';
                                }
                                

                                const ulElement = $('ul.mb-0.no-scrollbar.overflow-x-scroll.flex.py-2.items-center.shrink-0');
                                obj.images = [];
                                obj.image = '';

                                // Now you can work with the ulElement, for example, log its HTML
                                //console.log(ulElement.children().length);
                                if (ulElement && ulElement.children().length) {
                                    for (const liObj of ulElement) {
                                        const imgs = $('button', liObj).children();
                                        if (imgs.length) {                                            
                                            for (const img of imgs) {
                                                console.log('img: ', img.attribs.src);
                                                obj.images.push(img.attribs.src)
                                            }
                                            obj.image = obj.images[0];
                                            obj.images.shift();
                                        }
                                    }
                                } else {
                                    /*console.log('only default img: ');
                                    const defImgUl = $('ul.flex.no-scrollbar.w-full.mb-0');
                                    console.log('defImgUl: ', defImgUl);
                                    console.log('defImgUl.children().length: ', defImgUl.children().length);*/

                                    console.log('only default img: ');
                                    const defImgUl = $('img.object-contain.w-full.object-center.cursor-pointer');

                                    if (defImgUl && defImgUl.length > 0) {
                                        console.log('FOUND defImgUl: ');
                                        const defaultImgSrcs = defImgUl[0].attribs.srcset.split(" ");
                                        if (defaultImgSrcs && defaultImgSrcs.length > 0) {
                                            console.log('defaultImgSrcs.length: ');
                                            console.log('defaultImgSrcs[0]: ', defaultImgSrcs[0]);
                                            obj.image = defaultImgSrcs[0];
                                        } else {
                                            console.log('no defaultImgSrcs.length: ');
                                            obj.image = 'https://upload.wikimedia.org/wikipedia/fi/2/28/Tori.fi-Logo.png';
                                        }
                                    } else {
                                        console.log('NOT FOUND defImgUl: ');
                                        obj.image = 'https://upload.wikimedia.org/wikipedia/fi/2/28/Tori.fi-Logo.png';
                                    }

                                    //obj.images.push(myArray[0]) //ei oletuskuvaa muihin kuviin
                                }                                
                                
                                resolve(obj);
                                //resolve(true);
                                /*//////////////////
                                console.log(obj.name)
                                const images = cheerio('div > section > div ', descDiv)[0];
                                if (images.children[1] && images.children[1].children[0]) {
                                    if (images.children[1].children[0].name !== 'svg') {
                                        console.log('images element: ', images.children[1].children[0].name);
                                        for (const imgObj of images.children[1].children[0].children) {
                                            console.log('imgObj: ', imgObj.children[0].children[0].attribs.src);
                                        }
                                    } else {
                                        console.log('no image added');
                                    }
                                } else {
                                    console.log('no more images...');
                                }
                                
                                resolve(true);
                                */////////////////////////



                                //res.end(JSON.stringify('getDetails'));
                                /*const descDiv = Object.values(cheerio('.body', html))
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
                                resolve(obj)*/
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                    })
                };

/*
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
                     // Error!
                });
                return
                */
            })
            .catch(function (err) {
                console.log('Failed to fetch page: ', err);
            });


    })

    app.get('/second/:format', function (req, res) {
        const format = req.params.format
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(format));
    })

};
