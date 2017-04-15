(function() {
    'use strict';
    const bucketWebsite = 'http://wkronmiller-public-photos.s3-website-us-east-1.amazonaws.com';
    const s3 = new AWS.S3();
    function goAnon(request, callback) {
        request.removeListener('validate', AWS.EventListeners.Core.VALIDATE_CREDENTIALS);
        request.removeListener('sign', AWS.EventListeners.Core.SIGN);
        if(callback) {
            request.send(callback);
        }
        return request;
    }
    const bucketParam = {Bucket: 'wkronmiller-public-photos'};
    const filterBig = (key) => key.indexOf('fs8') === -1;
    const filterSmall = (key) => key.indexOf('fs8') !== -1;
    const imageFilter = (() => {
        if(window.innerWidth < 600) {
            return filterSmall;
        }
        console.log('Loading big images');
        return filterBig;
    })();
    const imagesPromise = new Promise((resolve) => {
        goAnon(s3.listObjects(bucketParam), (err, data) => {
            if(err) { throw err; }
            const {Contents} = data;
            const urls = Contents
                .map(({Key}) => Key)
                .filter(imageFilter)
                .map(key => `${bucketWebsite}/${key}`);
            const carouselDiv = $('.fotorama');
            urls.forEach(url => {
                const img = document.createElement('a');
                img.href = url;
                carouselDiv.append(img);
            });
            return resolve(carouselDiv);
        });
    });
    imagesPromise.then(() => {
        const head = $('head');
        const fotoScript = document.createElement('script');
        fotoScript.src='http://cdnjs.cloudflare.com/ajax/libs/fotorama/4.6.4/fotorama.js';
        head.append(fotoScript);
    });
})();

