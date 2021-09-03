const client = require('./index');

const Trakteer = new client({
    'XSRF-TOKEN': 'eyJpdiI6Ik04Smh4ejc3R2c1WStwWFVBN291R1E9PSIsInZhbHVlIjoiR2pvSHdDcmJiWjdPaGNyUDUwUnhcLzJzMTVjNzAyMjNVRGlmSW9GM2UxdHo4Rjh2S2tOXC9NMlp6V3UyZFpNdWNWIiwibWFjIjoiYTNjYTJhZjAyNjYwYzYzMWE4ZTUyNjg2YzU2ODYzZTQxMmZhMzZlNWQ4MjM3YWYwYzc1YjM5M2Y3NjFkOThhMyJ9',
    'trakteer-id-session': 'eyJpdiI6InJJdmxjalcxK2FTRHNTb3lESnZQelE9PSIsInZhbHVlIjoiaGhJYjFWWnpiUU42RThheElTOUVEYzYwRDBBXC9cL2drazlFcHNhNHJBMmt3d1lGeFlXa1Z3dENTeExoREg4R2o2IiwibWFjIjoiNDEwZTJjYTA5MzBhZjI2NjI0MDA5YjllMmZkNmY5ZjI2OTNkYjViNTEzYjUzM2NiNGQ0YTAzZDdmZGZmOTA1OSJ9',
    'webhook': 'https://discord.com/api/webhooks/831760097411596289/raqDJXrBJ6Otu5s9oZPMs7VfXPlOjhHK8-RCL5EOHCVGKo1oYj3Mm9DVxVixX5vbkxcT'
});


(async () => {

    //console.log(await Trakteer.getData());
    // console.log(await Trakteer.getSupporter());
    //console.log(await Trakteer.getSaldo());
    // console.log(await Trakteer.getTipReceived());
    Trakteer.getNotification(true, 30000);

    // const getOrderDetail = await Trakteer.getOrderDetail('7xp94wbvwk94z8dg');
    // console.log(getOrderDetail);

})()