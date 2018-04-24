import React, { Component } from 'react'
import './MiniPlay.scss'
import musicImg from '../../assets/music_default.png'
import SongList from '../../container/SongList'
import Player from '../../container/Player'

export default class MiniPlay extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timer: null,
      totalDuration: 0,
      showSongList: false,
      isInit: true
    }
    this.playMusic = this.playMusic.bind(this)
    this.showSongList = this.showSongList.bind(this)
    this.hideSongList = this.hideSongList.bind(this)
  }

  componentDidMount() {
    this.refs.musicAudio.load()
    // 添加事件监听，当准备好音频时再获取时长
    this.refs.musicAudio.addEventListener("canplay", () => {
      // 歌曲初始化完成后获取当前歌曲的播放时间
      let currentDuration = this.props.currentSong.currentDuration || 0
      if (this.state.isInit) {
        this.refs.musicAudio.currentTime = currentDuration
        this.setState({
          isInit: false
        })
      }
      if (this.props.playStatus == 1) {
        this.refs.musicAudio.play()
        this.setMusicPlayDuration()
        this.setState({
          totalDuration: this.musicAllTime()
        })
      } else {
        this.setState({
          totalDuration: this.musicAllTime()
        })
      }
    })
    this.refs.musicAudio.addEventListener("ended", () => {
      // 只有一首歌曲或者单曲循环时
      if (this.props.songList.length === 1 || this.props.playMode === 'SINGLE') {
        this.refs.musicAudio.play()
      } else {
        let playIndex = 0
        // 随机播放
        if (this.props.playMode === 'RANDOM') {
          playIndex = Math.floor(Math.random() * this.props.songList.length)
        } else {
          // 循环播放
          for(let [index, song] of this.props.songList.entries()) {
            if (song.songid === this.props.currentSong.songid) {
              playIndex = index
              break
            }
          }
          if (playIndex >= this.props.songList.length - 1) {
            playIndex = 0
          } else {
            playIndex ++
          }
        }
        this.props.playNextSong(this.props.songList[playIndex])
      }
    })
  }

  // 播放/暂停音乐
  playMusic() {
    if (this.props.playStatus == 0) {
      this.refs.musicAudio.play()
      this.setMusicPlayDuration()
      this.props.changePlayStatus(1)
    } else {
      this.refs.musicAudio.pause()
      this.setMusicPlayDuration()
      this.props.changePlayStatus(0)
    }
  }

  // 设置定时器处理音乐播放时间
  setMusicPlayDuration() {
    if (this.state.timer && this.props.playStatus == 0) {
      // 清除定时器
      clearInterval(this.state.timer)
      this.setState({
        timer: null
      })
    } else {
      // 设定定时器，根据播放时间调整播放进度
      let timer = setInterval(() => {
        let currentTime = this.musicCurrentTime()
        this.props.changeSongDuration(Object.assign({}, this.props.currentSong, {
          currentDuration: currentTime
        }))
      }, 1000)
      this.setState({
        timer: timer
      })
    }
  }

  // 获取音乐总时间
  musicAllTime() {
    return this.refs.musicAudio.duration || 0
  }

  // 获取音乐当前播放时间
  musicCurrentTime() {
    return (this.refs.musicAudio.currentTime + 2) || 0
  }
  // 设置播放进度
  setMusicProgress(duration) {
    if (this.state.totalDuration === 0) {
      return 0
    } else {
      return Math.floor(duration / this.state.totalDuration * 100)
    }
  }

  // 显示歌曲列表
  showSongList() {
    this.setState({
      showSongList: true
    })
  }

  // 隐藏歌曲列表
  hideSongList() {
    this.setState({
      showSongList: false
    })
  }

  render() {
    let currentSong = this.props.currentSong
    let playStatus = this.props.playStatus
    return (
      <div>
        <Player />
        <SongList showSongList={this.state.showSongList}
          parentHideSongList={this.hideSongList}
        />
        <div className="miniplay-component">
          <audio ref="musicAudio" src={currentSong.url} />
          <div className="song-info">
            <div className={'song-img ' + (playStatus == 1 ? 'imgRotate' : '')}>
              <img src={currentSong.albumpic ? currentSong.albumpic : musicImg} alt="" />
            </div>
            <div className="song-name-lyrics">
              <div className="song-name">{currentSong.name}</div>
              <div className="song-lyrics">{currentSong.singer}</div>
            </div>
          </div>
          <div className="operate-group">
            <div className="play-control">
              {
                playStatus == 1 &&
                <i className="iconfont icon-stop" onClick={this.playMusic} />
              }
              {
                playStatus == 0 &&
                <i className="iconfont icon-play" onClick={this.playMusic} />
              }
            </div>
            <div className="song-list">
              <i className="iconfont icon-list" onClick={this.showSongList}/>
            </div>
          </div>
          <div className="song-progress" style={{width: `${this.setMusicProgress(currentSong.currentDuration)}%`}}/>
        </div>
      </div>
    )
  }
}
