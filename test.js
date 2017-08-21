/**
 * Created by primenumbers3 on 21/8/17.
 */
var s = "html > body > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > form > table > tbody > tr:nth-child(2) > td:nth-child(1),html > body > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > form > table > tbody > tr:nth-child(4) > td:nth-child(1),html > body > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > form > table > tbody > tr:nth-child(20) > td:nth-child(1)";
var temp = s.split(',');
for (var i = 0; i < temp.length; i++) {
    console.log(temp[i]);
}