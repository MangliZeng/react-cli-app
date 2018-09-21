import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import { Carousel, Tooltip} from 'antd';

const text = [<span>放大</span>,<span>首页</span>,<span>末页</span>,<span>上一张</span>,<span>下一张</span>,<span>播放</span>,<span>暂停</span>,<span>慢进X2</span>,<span>快进X2</span>];
const picTool = ['enlarge','first', 'last', 'pre', 'next', 'play', 'stop', 'moderate', 'quicken' ];

class App extends Component {
  constructor () {
    super();
    this.state = {
      isDrag: false, //是否显示拖拽区域
      loadState: true,  //是否加载成功
      cur_index: 0,  //当前图片
      picTool_index: -1, //激活的按钮
      picSettings : { //轮播图的设置
        dots: false,
        infinite: true,
        speed: 30,
        slidesToShow: 1,
        slidesToScroll: 1,
        accessibility: true,
        autoplay: false,
        autoplaySpeed: 100,
        fade: true,
        cssEase: 'none',
        arrows: false,
        initialSlide: 0,
        centerMode: true,
        centerPadding:0
      }
    }
  }

  componentWillMount () {
    //轮播图片数组
    this.pic_img = []
    for(let i = 1;i <= 4; i++){
      this.pic_img.push(`img_${i}`)
    }
  }

  componentDidUpdate (a,b) {
    const { isDrag, picTool_index } = this.state;
    //当可拖拽的时候
    if (isDrag) {
      let imgDrag = this.refs.imgDrag
      if (imgDrag) {
        // 以鼠标位置为中心的滑轮放大功能
        this.addWheelEvent(imgDrag, function (delta) {
          let ratioL = (this.clientX - imgDrag.offsetLeft) / imgDrag.offsetWidth
          let ratioT = (this.clientY - imgDrag.offsetTop) / imgDrag.offsetHeight
          let ratioDelta = !delta ? (1 + 0.1) : (1 - 0.1)

          let h = parseInt(imgDrag.offsetHeight * ratioDelta)
          let w = parseInt(imgDrag.offsetWidth * ratioDelta)
          let l = Math.round(this.clientX - (w * ratioL))
          let t = Math.round(this.clientY - (h * ratioT))

          if(h<=0 || w<=0){
            if(delta){
              return
            }
          }
          if(h>2000 || w>2000){
            if(!delta){
              return
            }
          }

          imgDrag.style.width = w + 'px'
          imgDrag.style.height = h + 'px'
          imgDrag.style.left = l + 'px'
          imgDrag.style.top = t + 'px'
        })
        // 拖拽功能
        this.zoomPic(imgDrag)
      }
    }
    //当由激活的enlarge再次激活的时候，即：由拖拽区域变回去图片轮播的时候
    if(b.picTool_index === picTool_index && b.picTool_index === 0){
      this.setState({
        picTool_index: -1
      })
    }
  }
  // 滚动放大缩小事件
  addWheelEvent (obj, callback) {
    obj.addEventListener('mousewheel', (ev) => {
      let delta = ev.detail ? ev.detail > 0 : ev.wheelDelta < 0
      callback && callback.call(ev, delta)
      return false
    },false)
  }
  //阻止元素发生默认的行为
  prEvent (ev) {
    let zoEvent = ev || window.event
    if (zoEvent.preventDefault) {
      zoEvent.preventDefault()
    }
    return zoEvent
  }
  //移除事件
  removeEvent (obj, sType, fn){
    if(obj.removeEventListener){
      obj.removeEventListener(sType, fn, false)
    } else {
      obj.detachEvent('on'+sType, fn)
    }
  }
  //添加事件
  addEvent (obj, sType, fn){
    if (obj.addEventListener){
      obj.addEventListener(sType, fn, false)
    } else {
      obj.attachEvent('on' + sType, fn);
    }
  }
  //拖拽事件
  zoomPic (imgDrag) {
    let that  = this
    that.addEvent(imgDrag, 'mousedown', function (ev) {
      let zoomEvent = that.prEvent(ev)
      let zoomParent = imgDrag.parentNode
      let disX = zoomEvent.clientX - imgDrag.offsetLeft
      let disY = zoomEvent.clientY - imgDrag.offsetTop
      let startMove = function (ev) {
        //元素绑定事件
        if (zoomParent.setCapture) {
          zoomParent.setCapture()
        }
        let zoEvent = ev || window.event
        let l = zoEvent.clientX - disX
        let t = zoEvent.clientY - disY
        imgDrag.style.left = l + 'px'
        imgDrag.style.top = t + 'px'
        zoomParent.onselectstart = function () {
          return false
        }
      }
      let endMove = function (ev) {
        //元素解除事件
        if (zoomParent.releaseCapture) {
          zoomParent.releaseCapture()
        }
        zoomParent.onselectstart = null
        that.removeEvent(zoomParent, 'mousemove', startMove)
        that.removeEvent(zoomParent, 'mouseup', endMove)
      }
      that.addEvent(zoomParent, 'mousemove', startMove)
      that.addEvent(zoomParent, 'mouseup', endMove)
      return false
    })
  }
  //图片操作【放大、上一张、下一张、播放、暂停、快进、慢进】
  opePic (opeName, index) {
    const { picSettings, isDrag } = this.state;
    switch (opeName) {
      case 'enlarge' :
        this.setState({
          picTool_index: index,
          picSettings: {...picSettings, autoplay: false},
          isDrag: !isDrag //是否显示拖拽区域
        });
        break;
      case 'first' :
        if(isDrag === false) {
          this.refs.carousel.innerSlider.slickGoTo(0);
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplay: false}
          });
        }
        break;
      case 'last' :
        if(isDrag === false) {
          this.refs.carousel.innerSlider.slickGoTo(this.pic_img.length - 1);
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplay: false}
          });
        }
        break;
      case 'pre' :
        if(isDrag === false) {
          this.refs.carousel.innerSlider.slickPrev();
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplay: false}
          });
        }
        break;
      case 'next' :
        if(isDrag === false) {
          this.refs.carousel.innerSlider.slickNext();
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplay: false}
          });
        }
        break;
      case 'play' :
        if(isDrag === false) {
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplay: true}
          }, () => {
            this.refs.carousel.innerSlider.autoPlay()
          });
        }
        break;
      case 'stop' :
        if(isDrag === false){
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings,autoplay: false}
          });
        }
        break;
      case 'moderate' :
        if(isDrag === false) {
          let m_newSpeed = picSettings.autoplaySpeed + 20;
          if (m_newSpeed > 1500) {
            return
          }
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplaySpeed: m_newSpeed},
            isDrag: false //是否显示拖拽区域
          });
        }
        break;
      case 'quicken' :
        if(isDrag === false) {
          let q_newSpeed = picSettings.autoplaySpeed - 20;
          if (q_newSpeed < 100) {
            return
          }
          this.setState({
            picTool_index: index,
            picSettings: {...picSettings, autoplaySpeed: q_newSpeed},
            isDrag: false //是否显示拖拽区域
          });
        }
        break;
      default:
        break;
    }
  }
  //当前是第几张图片
  changeIngPreIndex (orderIndex, newIndex) {
    this.setState({
      cur_index: newIndex
    });
  }
  //轮播图鼠标滚动轮播
  handleMouseWheel (event) {
    let wheelDirection = event.deltaY;
    if (wheelDirection < 0) {
      this.refs.carousel.innerSlider.slickPrev();
    } else if (wheelDirection > 0) {
      this.refs.carousel.innerSlider.slickNext();
    }
  }

  render() {
    const { picSettings, loadState, cur_index, picTool_index } = this.state;

    return (
      <div className="App">
        {/*操作按钮*/}
        <div style={{marginBottom: "50px"}}>
          {
            picTool && picTool.length > 0 ?
              picTool.map((item, index) => {
                let icon_class = loadState ? picTool_index === index ? 'cur_icon_bg' : 'icon_bg' : '';
                return (
                  <span style={{margin: "0 10px", cursor: "pointer"}} key = { index }>
                    <Tooltip placement = "bottom" title = { text[index] }>
                      <i className = {icon_class} onClick={this.opePic.bind(this, item, index)}>
                        { picTool[index] }
                      </i>
                    </Tooltip>
                  </span>
                )
              }) : ""
          }
        </div>
        {/*图片信息-*/}
        {
          this.pic_img && this.pic_img.length > 0 ?
            <div className="pic_info">
              { this.state.isDrag ? // 图片可拖区域
                <div style={{position:"relative",width:"100%",height:"700px", background: "#999999"}}>
                  <div style={{overflow: "hidden",width: "100%", height: "100%", position: "absolute", top: 0, left: 0}}>
                    <img style={{ position: "absolute", cursor: "move" }}ref="imgDrag" src = {process.env.PUBLIC_URL + `/img/${this.pic_img[cur_index]}.png`} alt=""/>
                  </div>
                </div>
                : // 轮播图
                <div className="carouselBox" onWheel={this.handleMouseWheel.bind(this)}>
                  <Carousel {...picSettings} ref="carousel" beforeChange = { this.changeIngPreIndex.bind(this)}>
                    {
                      this.pic_img.map((item, index) => {
                        return (
                          <div key = {index}><img src = {process.env.PUBLIC_URL + `/img/${item}.png`} alt=""/></div>
                        )
                      })
                    }
                  </Carousel>
                </div> }
            </div> : <div>暂无图片数据</div>
        }
      </div>
    );
  }
}

export default App;
