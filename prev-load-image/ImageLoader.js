let base = 0;
let Img = function(src) {
 this.src = src;
 this.status = false;
 this.fail = false;
}
 
let loop = (o, res, keyArr) => {
 let tem = Object.keys(o);
 tem.map(v => {
 if (typeof o[v] === 'object') {
 loop(o[v], res, keyArr);
 } else {
 if(v === 'BASE') {
 base = o[v];
 } else {
 res.push(o[v]);
 keyArr.push(v)
 }
 }
 });
}
 
function ImageLoader(obj) {
 let arr = [];
 let loadKey = [];
 let imageTempList = []
 if(obj.loading) {
 this.loadingcallback = obj.loading;
 }
 if(obj.loaded) {
 this.loadedcallback = obj.loaded;
 }
 if(obj.doing) {
 this.doingcallback = obj.doing;
 }
 
 if(obj.base) {
 base = obj.base
 }
 this.insert = (item) => {
 arr.push(item);
 };
 
 this.init = (o) => {
 let res = [];
 loop(o, res, loadKey);
 res.map((v) => {
 this.insert(new Img(v));
 });
 this.load();
 };
 
 this.load = () => {
 this.start = (new Date).getTime();

 const that = this
 arr.map((v,index) => {
 let src = base ? base + v.src: v.src;
 wx.getImageInfo({
 src: src,
 success: res => {
 v.status = true;
 const temp = {
   key: loadKey[index],
   path: res.path
 }
 imageTempList.push(temp)
 that.doingcallback(res,loadKey,index)
 },
 fail: err => {
 v.fail = true;
 }
 })
 });
 let timer = setInterval(() => {
 let status = this.isLoaded();
 if (status) {
 clearTimeout(timer);
 }
 }, 200);
 
 setTimeout(() => {
 clearTimeout(timer);
 }, 60000);
 };
 
 this.isLoaded = () => {
 let status = true,
 count = 0,
 fail = 0;
 arr.map((v) => {
 if (!v.status) {
 status = false;
 } else {
 count += 1;
 }
 if(v.fail) {
 status = true;
 fail += 1;
 }
 });
 if(status) {
 if(this.loadedcallback) {
 this.loadedcallback({
 status: true,
 timecost: (new Date).getTime() - this.start,
 success: count,
 fail: fail,
 totalcount: arr.length,
 imageTempList
 })
 }
 } else {
 if(this.loadingcallback) {
 this.loadingcallback({
 status: false,
 percent: count / arr.length
 });
 }
 }
 return status;
 };
 if(obj.source) {
 this.init(obj.source);
 }
}
module.exports = ImageLoader