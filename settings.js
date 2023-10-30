/* 
<ul>
    <li>
        <a href="test">Test</a>
        <ul>
            <li>
                <a href="test">Test</a>
            </li>
            <li>
                <a href="test">Test</a>
            </li>
        </ul>
    </li>
</ul>*/

links = {
    "Browser Defaults": {
        "Theme": "lionBrSettingsPage.html",
        "Search Engine": "lionBrSettingsPage.html",
        "Launch at startup": "lionBrSettingsPage.html"
    },
    "User Preferences": {
        "Bookmarks": "lionBrBookmarkSettingsPage.html"
    },
}

linkList = document.createElement("ul");
// Make link list EXACTLY based on above
for (var key in links) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.innerHTML = key;
    li.appendChild(a);
    var ul = document.createElement("ul");
    for (var key2 in links[key]) {
        var li2 = document.createElement("li");
        var a2 = document.createElement("a");
        a2.innerHTML = key2;
        a2.href = links[key][key2];
        li2.appendChild(a2);
        ul.appendChild(li2);
    }
    li.appendChild(ul);
    linkList.appendChild(li);
}

document.getElementById('navigation').appendChild(linkList);