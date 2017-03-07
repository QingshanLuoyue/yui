$(function(){
    // 带有右菜单的cell组合
    var oldx;
    $('.yui_slide').on('touchstart',function(e) {
        oldX = e.originalEvent.touches[0].clientX;
    }).on('touchmove',function(e){
        var newX = e.originalEvent.touches[0].clientX;
        var res = newX - oldX;
        var startDis = 20;
        var menuWidth = $('.yui_cell_menu').width();
        if (res >= startDis) { // 向右滑动  隐藏菜单
            $(this).css({
                '-webkit-transform': 'translateX(-'+ 0 +'%)',
                'transform': 'translateX(-'+ 0 +'%)'
            })
        } else if (res < -startDis) { // 向左滑动  滑出菜单
            $(this).css({
                '-webkit-transform': 'translateX(-'+ menuWidth +'px)',
                'transform': 'translateX(-'+ menuWidth +'px)'
            })
        }
    })
})