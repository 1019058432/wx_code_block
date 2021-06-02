
// 图片预加载
/**
 * 
 * @param {string} version 图片版本
 * @param {Array} target 图片数组
 * @param {function} callback 完成版本检测后触发并返回本地已有的缓存结果对象
 * @param {function} callFail 版本检测不通过的数据被加载完并缓存在本地后返回缓存结果对象
 */
function driverLoadImag(version='1.0.0',target,callback,callFail) {
  const preLoadImageList = {} // 图片版本
  const failReadLocalStore = {} // 图片版本
  // const that = this
  Object.keys(target).map(item => {
    const path = checkImageVersion(item,version)
    if (path) {
      preLoadImageList[item] = path
    } else {
      failReadLocalStore[item] = target[item] + '?v=' + version
    }
  })
  if (Object.keys(failReadLocalStore).length > 0) {
    prevLoadImag(failReadLocalStore,version,callFail(res))
  }
  typeof callback == 'function' && callback(preLoadImageList)
}

/**
 * 
 * @param {Object} source 待加载图片键值对对象
 * @param {string} version 图片版本
 * @param {function} callback 完成加载后触发并返回本地缓存结果对象
 */
 function prevLoadImag(source,version,callback) {
  const ImageLoader = require('../../utils/ImageLoader.js');
  const ImageSource = source; // 待加载图片路径资源
  new ImageLoader({
    // base: ImageSource.BASE,
    source: [ImageSource],
    loading: res => {
    // 可以做进度条动画
    // console.log(res);
    },
    loaded: res => {
    // 可以加载完毕动画
    // console.log(res);
    const target = res.imageTempList //临时图片缓存路径数组
    const fs = wx.getFileSystemManager()
    const arr = [] // promise异步任务数组
    const pathObject = {} // 本地永久缓存路径
    target.map(item => {
      let func = new Promise((resolve,reject) => {
        fs.saveFile({
          tempFilePath: item.path, // 传入一个临时文件路径
          success(res) {
            pathObject[item.key] = res.savedFilePath // 保存本地缓存路径
            // console.log('图片缓存成功', res.savedFilePath) // res.savedFilePath 为一个本地缓存文件路径  
            //协议名在 iOS/Android 客户端为 "wxfile"，在开发者工具上为 "http"，
            // 那么我们把本地缓存的路径，通过小程序的数据缓存服务保存下来。
            // 下次打开小程序 首先去缓存中检查是否存在本地文件的缓存路径
            // 如果有，直接image src赋值本地缓存路径。
            //如果没有，则是第一次下载图片，或者用户手动清理缓存造成的。
            wx.setStorageSync(item.key, res.savedFilePath+'?v='+version) // 以原图片名为key存储图片
            resolve()
          },
          fail(err) {
            reject(err)
          }
        })
      })
      arr.push(func) // 将异步任务加入队列
    })
    
    Promise.all(arr).then(result => {
      // console.log(pathObject,555);
      const temp = {}
      target.map(element => {
        temp[element.key] = this.checkImageVersion(element.key,version)
      })
      typeof callback == 'function' && callback(temp)
    })
    },
    // 加载完某一张时触发
    doing: (res,arr,currentIndex) => {
      // console.log(res, 'doging');
      // console.log(arr, 'arrrrr');
      // console.log(currentIndex, 'currentIndex');
      //const temp[arr[currentIndex]]=res.path
    }
    });
 }
function checkImageVersion(name,version) {
   /// 重新启动小程序，去缓存中获取图片的缓存地址。 然后给Imagesrc赋值
  const path = wx.getStorageSync(name)
  const reg = new RegExp(/v=(.+)/)
  if (path != null && path.match(reg) && version === path.match(reg)[1]) {
    // console.log('path====', path)
    return path
  }else {
    // console.log('去缓存图片')  
    return false
  }
 }
module.exports  = {
  driverLoadImag,
  prevLoadImag,
  checkImageVersion,  
}

 