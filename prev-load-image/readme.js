
function JS() {
  // 引入
  // import {
  //   driverLoadImag,
  //   prevLoadImag,
  //   checkImageVersion,  
  // } from '../../utils/driver-load-image'
  
  // 调用
  const version = '1.0.0'
  const ImageObjectSource = {
    paramname: 'http://www.baidu.com/test.png'
  }
  // 启用预加载并将回调函数返回的图片路径集合赋值
  driverLoadImag(version,ImageObjectSource,(res1) =>{
    that.setData({
      preLoadImagedArr: res1
    })
  },(res2) => {
    const temp = {
      ...res2,
      ...that.data.preLoadImagedArr
    }
    this.setData({
      preLoadImagedArr: temp
    })
  })
}