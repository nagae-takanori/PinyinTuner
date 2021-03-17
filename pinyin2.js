var ProgramName = 'Pinyin Tuner';
var Version = 20210316;

// カテゴリー 0から4まで
var PinyinClasses = ["上平声", "下平声", "上声", "去声", "入声"];

// 通韻 平声だけ
var Compatibles = [["0_1", "0_2", "0_3"],["0_4", "0_5"],["0_6", "0_7"],["0_8", "0_9", "0_10"],
	["0_11", "0_12", "0_13", "0_14", "0_15", "1_1"], ["1_2", "1_3", "1_4"], ["1_5", "1_6"],
	["1_8", "1_9", "1_10"], ["1_12", "1_13", "1_14", "1_15"]];

// 発音
var Pronouns =[
	["uŋ","uoŋ","ʌŋ","iᴇ","ʉi","ɨʌ","ɨo","ei","ɛ","uʌi","iɪn","ɨun","ʉɐn","ɑn", "an"],
	["en","eu","au","ɑu","ɑ","a","ɐŋ","æŋ","eŋ","ɨŋ","ɨu","iɪm","ʌm","iᴇm","ɛm"],
	["uŋX","ɨoŋX","ʌŋX","ʉiX","ɨʌX","uo|ɨoX","eiX","ɛX","uʌiX","iɪnX","ɨunX","ʉɐnX","ɑnX","an|anX","enX","euX","auX|auH","ɑuX","ɑX","aX","ɨɐŋX","æŋX","eŋX","ɨuX","iɪmX","ʌmX","iᴇmX","ɨɐmX"],
	["uŋH","uoŋH","ʌŋH","iɪH|iuɪH|iuɪt̚","ʉiH","ɨʌH","ɨoH","eiH","ɑiH","uɛH","uʌiH","iɪnH","ɨunH","ʉɐnH","ɑn|ɑnH","anH","enH","euH","auH","ɑuH","ɑH","aH","ɨɐŋH","iæŋH","eŋH","ɨuH","iɪmH","ʌmH","emH","ɛmH"],
	["uk̚","uok̚","ʌk̚","iɪt̚","ɨut̚","ʉɐt̚","ɑt̚","ɛt̚","et̚","ɨɐk̚","æk̚","ek̚","ɨk̚","iɪp̚","ʌp̚","iᴇp̚","ɛp̚"]];
	
var pinyin_line = function(str){
	var retval = [];
	$.each(str.split(""), function(i0, v0){// 文字列を文字に分解
		var hits = [];
		$.each(LETTERS, function(i1, v1){// 上平声、下平声、上声、去声、入声
			$.each(v1, function(i2, v2){
				if(v2.indexOf(v0) >= 0){
					hits.push([i1,i2,v2[0]]); 
				};
			});
		});
		retval.push([v0, hits]);
	});
	return retval;
};


var lineByLine = function(line, row){
	var tmp = '<span style="z-index:' + row + ';">';
	var column = 0;
	$.each(line.split(""), function(index, char){
		var values = CHARACTERS[char];
		var accent0 = values[0];
		var accent1 = values[1];
		var results = values[2];
		var numObliq = 0;// 仄の数
		var numLevel = 0;// 平の数

		var tmp2 = '';
		column += 1;
		$.each(results, function(i1, v1){
			var tone = "";
			if(v1[0] <= 1){
				numLevel += 1;
				tone = "level";
			} else {
				numObliq += 1;
				tone = "oblique";
			}
			tmp2 += '<span class="' + v1[0] + '_' + (v1[1] + 1) + ' ' + tone + ' ruby">' + v1[2] + '<span class="hint">' + v1[3] + '</span></span>';
		});
		
		if(results.length > 1){ // 複数判定
			if(numObliq == 0){ // 平
				tone = "level";
			} else if(numLevel == 0){ // 仄
				tone = "oblique";
			} else {
				tone = "mixed";
			}
		} else if(results.length < 1){ // 判定不能
			tone = "unknown";
		} else { // 1種類
			if(numLevel == 1){
				tone = "level";
			} else {
				tone = "oblique";
			}
		}
		
		tmp += '<div class="charbox ';
		switch(accent1){
		case 1:
			tmp += 'bg1';
			break;
		case 2:
			tmp += 'bg2';
			break;
		case 3:
			tmp += 'bg3';
			break;
		case 4:
			tmp += 'bg4';
			break;
		default:
			tmp += 'bg_unknown';
		}
		tmp += '">';
		tmp += '<a class="large ' +  tone +  '" href="' + encodeURI('http://ja.wiktionary.org/wiki/' + char) + '">' + char + '</a><br>';
		tmp += '<span>' + tmp2 + '</span>';
		tmp += '<br><span class="mruby">' + accent0 + accent1 + '</span>';// 北京語のルビ
		tmp += '</div>';
		if(line.length == 7){// 七言のとき、2字目と4字目の後に空白を入れる。
			if(column == 2 || column == 4){
				tmp += '<div class="spacebox"></div>';
			}
		} else if(line.length == 5 && column == 2){// 五言のとき 2字目の後に空白を入れる。
			tmp += '<div class="spacebox"></div>';
		}
	});
	tmp += '</span><br clear="all">';
	$('#matrix').append(tmp);
};

var showMatches = function(chr, cls){
	var tmp = chr.split('_');
	$('#messages').append('<h4 class="' + cls + '">' + PinyinClasses[tmp[0]] + tmp[1] + LETTERS[tmp[0]][tmp[1] - 1][0] + ' /' +
		Pronouns[tmp[0]][tmp[1] - 1] + '/</h4>' + LETTERS[tmp[0]][tmp[1] - 1].join(' '));
};

var mainProc = function(){
	var author = $('input[name="author"]').val();
	var title = $('input[name="title"]').val();
	var poetry = $('textarea[name="poetry"]').val();
	var lines = poetry.split(/\n|\s/);
	$('#main').html('<h2><a href="' +  encodeURI('http://ja.wikipedia.org/wiki/' + author) + '">' +
		author + '</a> ' + title + '</h2><div id="matrix"></div>');
	
	var row = 0;
	$.each(lines, function(i, v){
		lineByLine(v.replace(/^\s+|\s+$/g, ""), row);
		row -= 1;
	});
	$(".ruby").click(
		function(){
			var char = $(this).parent().prev().prev();
			if($(this).hasClass("oblique")){
				char.removeClass("mixed level").addClass("oblique");
			} else if($(this).hasClass("level")){
				char.removeClass("mixed oblique").addClass("level");
			};
		}
	);
	$(".ruby").hover( // ルビのマウスオーバーの処理（再描画されるたびにイベントを再登録する必要がある）
		function(){// マウスオーバー開始
			var c = this.className.split(' ')[0];// 同一韻
			var d = [];// 通韻
			
			$('#messages').html($(this).children().html());
			$.each(Compatibles, function(i, v){
				if(v.indexOf(c) >= 0){
					d = v;
				}
			});
			
			$(".ruby").each(function(i0, v0){
				if($(v0).hasClass(c)){
					v0.style.color = 'black';
					v0.style.backgroundColor = 'yellow';
				} else {
					$.each(d, function(i1, v1){
						if(v1 != c && $(v0).hasClass(v1)){
							v0.style.color = 'black';
							v0.style.backgroundColor = 'lightgreen';
						}
					});
				}
			});

			showMatches(c, "same");
			$.each(d, function(i, v){
				if(v != c){
					showMatches(v, "compat");
				}
			});
		},
		function(){// マウスオーバー終了
			$(".ruby").each(function(i, v){
				v.style.color = '';
				v.style.backgroundColor = '';
			});
		}
	);
};

var exampleListing = function(poetry, num){
	$.each(poetry, function(i0, v0){
		$.each(v0, function(i1, v1){
			$('#examples' + num + ' ul').append('<li>' + i0 + ' ' + i1 + '</li><br>');
		});
	});
	// 例文をクリックしたときの処理
	$('#examples' + num + ' ul li').each(function(i, v){
		var tmp = $(v).text().split(' ');
		var tmp2 = poetry[tmp[0]][tmp[1]].replace(/\s/g, "\n");
		$(v).on('click', function(){
			$('input[name="author"]').val(tmp[0]);
			$('input[name="title"]').val(tmp[1]);
			$('textarea[name="poetry"]').val(tmp2);
			mainProc();
		});
	});
};

$(function(){// ページが読み込まれた直後に一度だけ呼ばれる関数
	$('.program_name').html(ProgramName);
	$('.version').html(Version);

	$('#button1').on('click', mainProc);// 送信ボタンを押したら
	mainProc();// 送信ボタンを押さなくても最初の1回は
	
	// 例文のリスト
	exampleListing(POETRY, 1);
	exampleListing(POETRY2, 2);
	exampleListing(POETRY3, 3);

	// いわゆるアコーディオン
	$('.box').on('click', function (ev) { // 親へ伝播不可にする（メニューの中身をクリックしても反応しないように）。
       	ev.stopPropagation();
	});
	$('.menu').click(function() {// メニューをクリックしたら
		var thisbox = $(this).children('.box');// そのメニューの子のボックスを取り出し
		thisbox.slideToggle();// ボックスを開け閉めして、
		$('.box').not(thisbox).slideUp();// それ以外のボックスを閉じる
	});
});
