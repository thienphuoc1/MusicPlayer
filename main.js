/**
 * 1. Render songs => OK
 * 2. Scroll top => OK
 * 3. Play / Pause / Seek => OK
 * 4. CD rotate => OK
 * 5. Next / Previous song => OK
 * 6. Random => OK
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when clicked
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'TP_Player';

const player = $('.player');
const heading = $('header h2');
const songName = $('.song__name');
const songAuthor = $('.song__author');
const cdThumbnail = $('.cd-thumb')
const audio = $('#audio');
const cd = $('.cd')
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const songCurrentTime = $('.current-time');
const songDurationTime = $('.duration-time');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: 'Mượn rượu tỏ tình',
            singer: 'BIGDADDY x EMILY',
            path: './assets/music/Muon-Ruou-To-Tinh-BigDaddy-Emily.mp3',
            image: './assets/img/song1.png',
        },
        {
            name: 'SAU TẤT CẢ',
            singer: 'ERIK',
            path: './assets/music/Sau-Tat-Ca-ERIK.mp3',
            image: './assets/img/sautatca.jpg'
        },
        {
            name: 'MÙA ĐÔNG (WINTER)',
            singer: 'ERIK',
            path: './assets/music/Mua-Dong-ERIK.mp3',
            image: './assets/img/muadong.jpg'
        },
        {
            name: 'Mình Yêu Nhau Đi',
            singer: 'BÍCH PHƯƠNG',
            path: './assets/music/Minh-Yeu-Nhau-Di-Bich-Phuong.mp3',
            image: './assets/img/minhyeunhaudi.jpg'
        },
        {
            name: 'LOVE ME MORE (ORIGINAL)',
            singer: 'THE SHEEP',
            path: './assets/music/Love-Me-More-The-SHEEP.mp3',
            image: './assets/img/lovememore.jpg'
        },
        {
            name: 'EM KHÔNG QUAY VỀ',
            singer: 'HOÀNG TÔN ft. YANBI',
            path: './assets/music/Em-Khong-Quay-Ve-Hoang-Ton.mp3',
            image: './assets/img/emkhongquayve.jpg'
        },
        {
            name: 'Chỉ Có Em',
            singer: 'Hoàng Tôn ft Kay Trần ft Bảo Kun',
            path: './assets/music/Chi-Co-Em-Hoang-Ton-BAK-Bao-Kun-Kay-Tran.mp3',
            image: './assets/img/chicoem.jpg'
        },
       
        
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    timeFormat(seconds){
        const date = new Date(null)
        date.setSeconds(seconds)
        return date.toISOString().slice(14, 19)
    },

    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xử lý rotate CD / dừng
        const cdThumbnailAnimation = cdThumbnail.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 giây
            iterations: Infinity,
        })
        cdThumbnailAnimation.pause();

        //Xử lý phóng to thu nhỏ CD khi lướt danh sách bài hát
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Play bài hát
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                _this.isPlaying = false;
                audio.pause();
                player.classList.remove('playing');
            } else{
                audio.play();
            }
        }

        //Khi bài hát được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbnailAnimation.play();
        }

        //Khi bài hát được pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbnailAnimation.pause();
        }

        //Khi next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi prev bài hát
        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi bật tắt random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }
        
        //Khi bật tắt repeat song
        repeatBtn.onclick = function() {
            _this.isRepeat =!_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                progress.style.background = `linear-gradient(to right, #ff2a5f ${progressPercent}%, #ccc 0%)`;
            }
            songCurrentTime.textContent = _this.timeFormat(this.currentTime)
            songDurationTime.textContent = _this.timeFormat(this.duration)
        }

        //Tua nhạc
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        //Xử lý sau khi audio ended
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            }
            
        }

        //Play song when clicked
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if(songNode || e.target.closest('.option')) {
                
                //Xử lý khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                //Xử lý khi click vào option
                if(e.target.closest('.option')) {
                    
                }
                
            }
        }
    },

    loadCurrentSong: function() {
        songName.textContent = this.currentSong.name;
        songAuthor.textContent = this.currentSong.singer;
        cdThumbnail.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        // Xử lý lấy tiến trình và thời lượng bài hát trước khi phát
        audio.onloadedmetadata = function(){
            songCurrentTime.textContent = _this.timeFormat(this.currentTime.toFixed(2))
            songDuration.textContent = _this.timeFormat(this.duration.toFixed(2))
        }

    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    
    playRandomSong: function() {
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'nearest',
            });
        }, 200)
    },
    
    start: function() {
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        //Lắng nghe các sự kiện(DOM Events)
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng 
        this.loadCurrentSong();

        //Render danh sách các bài hát
        this.render();

        //Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', _this.isRandom);
        repeatBtn.classList.toggle('active', _this.isRepeat);
    }
}

app.start()
