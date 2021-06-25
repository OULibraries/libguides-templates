$(document).ready(function() {
    // Check if admin or public side and add appropriate content:
    // Important! If the name of the CSS file added is changed to something other than local.css, this code will also need to change.
    if (!$("link[href='//libapps.s3.amazonaws.com/sites/615/include/local.css']").length) adminPanelSetup();
    else publicSetup();

    // Remove page navigation if it has no content
    if ($("#page-navigation").children().length === 0) $("#page-navigation").remove();
    else {
        // ensure << and >> hidden from screen reader
        let p = $("#page-navigation .previous a");
        if (p.length > 0) {
            p.text(p.text().replace("<<","").replace("Previous:",""));
            p.prepend('<span aria-hidden="true"><<</span> <span style="font-weight:bold;">Previous: </span>');
        }
        let n = $("#page-navigation .next a");
        if (n.length > 0) {
            n.text(n.text().replace(">>","").replace("Next:",""));
            n.prepend('<span style="font-weight:bold;">Next: </span>');
            n.append('<span aria-hidden="true">>></span>');
        }
    }
    // Remove aside if it has no content, otherwise check for quick links and change aria-label as needed
    sideTitles = $("#side-nav-aside").find(".s-lg-col-boxes h2");
    if (sideTitles.length === 0) $("#side-nav-aside").remove();
    else if (sideTitles.text().toLowerCase().includes("quick links")) {
        // TODO: Which first?
        if (sideTitles.length > 1) $("#side-nav-aside").attr("aria-label", "Quick Links and Contact Information");
        else $("#side-nav-aside").attr("aria-label", "Quick Links");
    }

    // Links
    // Prevent external link duplicates
    $("span.fa.fa-fw.fa-external-link").parent().children(".sr-only").remove();
    $("span.fa.fa-fw.fa-external-link").remove();
    // Reduce number of links in guide lists
    if ($(".s-lg-guide-list-info").length > 0) {
        for (let item of $(".s-lg-guide-list-info").find("a")) {
            item.replaceWith(item.text);
        }
    }
    // External links
    $("main a[target='_blank']").append("<span class='sr-only'>Opens in new window</span><i aria-hidden='true' class='fa fa-edit fa-external-link'></i>");

    // Fix tabbed boxes
    for (let tabBox of $(".s-lib-box .s-lib-jqtabs")) {
        // get list of tabs and list of tabpanels
        let tabs = $(tabBox).find("ul.nav-tabs li a");
        let tabpanels = $(tabBox).find(".tab-content .tab-pane");
        let tablist = $('<div class="nav nav-tabs" role="tablist"></div>');
        $(tabBox).append(tablist);
        for (let i = 0; i < tabs.length; i++) {
            let tab = $('<button role="tab" aria-selected="false" tabindex="-1"></button>');
            if (i === 0) {
                $(tab).attr("aria-selected", "true");
                $(tab).addClass("active");
                $(tab).attr("tabindex", "0");
            }
            $(tab).attr("id", $(tabs[i]).attr("id"));
            $(tab).attr("aria-controls", $(tabpanels[i]).attr("id"));
            $(tab).text($(tabs[i]).text());
            $(tablist).append(tab);
            $(tabpanels[i]).attr("aria-labelledby", $(tabs[i]).attr("id"));
        }
        // move content
        $(tabBox).append(tabpanels);
        tabs.remove();
        $(tabBox).children("ul.nav-tabs, div.tab-content").remove();
    }
    // set aria-label or aria-labelledby for tablist
    if ($(".s-lib-floating-box").length > 0) {
        // turn tablists into floating boxes
        $(".s-lib-jqtabs .nav-tabs").each(function(index) {
            let parent = $(this).parents(".s-lib-box").first();
            $(this).attr("aria-label", parent.children("h2").text());
            parent.addClass("s-lib-floating-box");
            parent.children("h2").first().remove();
            parent.find(".s-lib-box-content").addClass("s-lib-floating-box-content");
        });
    } else {
        $(".s-lib-jqtabs .nav-tabs").each(function(index) {
            let h2 = $(this).parents(".s-lib-box").children("h2");
            let id = $(this).parents(".s-lib-box").attr("id") + "-heading";
            h2.attr("id", id);
            $(this).attr("aria-labelledby", id);
        });
    }
    // add event listeners
    $(".s-lib-jqtabs .nav-tabs button").on('click keyup', function(e) {
        if (e.type === "click" || e.which === 32 || e.which === 13) {
            let parent = $(this).parents(".s-lib-jqtabs");
            // deactivate old tab
            $(parent).find(".nav-tabs .active").attr("aria-selected", "false");
            $(parent).find(".nav-tabs .active").attr("tabindex", "-1");
            $(parent).find(".active").removeClass("active");
            // activate new tab
            $(this).addClass("active");
            $(this).attr("aria-selected", "true");
            $(this).attr("tabindex", "0");
            $(parent).find("#"+$(this).attr("aria-controls")).addClass("active");
        } else if (e.which === 39 || e.which === 37 || e.which === 36 || e.which === 35) {
            e.preventDefault();
            let tabs = $(this).parent().children("button");
            if (e.which === 39) {
                // right arrow
                if ($(this).next("button").length > 0) $(this).next("button")[0].focus();
                else tabs[0].focus();
            } else if (e.which === 37) {
                // left arrow
                if ($(this).prev("button").length > 0) $(this).prev("button").focus();
                else tabs[tabs.length-1].focus();
            } else if (e.which === 36) {
                // home
                tabs[0].focus();
            } else if (e.which === 35) {
                // end
                tabs[tabs.length-1].focus();
            }
        }
    });

    // Set profile box image link alt text to null
    $(".s-lib-profile-container a img").attr("alt", "");

    // Remove first link (OU Libraries) from breadcrumb navigation
    $("ol.breadcrumb li").first().remove();

    // TODO: Allow focusing on table rows?
    // $("table tbody tr").attr("tabindex", "0");

    // Fix weird Firefox link display issue
    $(".s-lg-link-list li>div").removeClass("clearfix");
});

function adminPanelSetup() {
    // if column two has no content, add a button that allows hiding it
    let col2 = $("#s-lg-col-2");
    if (col2[0].childNodes[1].childNodes.length == 1) {
        col2.prepend("<button id='col2-toggle' onClick='toggleColumnTwo(true)'>Hide Column Two</button>");
        // if column two was previously hidden (and not unhidden), hide it
        // TODO: Make this unique to a given guide?
        if (localStorage.getItem("hideColumnTwo") === "true") toggleColumnTwo(true);
    }
}
// allows showing/hiding column two, assuming the column currently has no content
function toggleColumnTwo(hide) {
    let col2 = $("#s-lg-col-2");
    if (hide) {
        col2.css("display", "none");
        $("main").prepend("<div class='row' id='placeholder-row'><div class= 'col-md-6'></div><div class='col-md-6'><button id='col2-toggle' onClick='toggleColumnTwo(false)'>Show Column Two</button></div></div>");
        localStorage.setItem("hideColumnTwo", "true");
    } else {
        $("#placeholder-row").remove();
        col2.css("display","block");
        localStorage.setItem("hideColumnTwo", "false");
    }
}

function publicSetup() {
    // Remove the column 2 div if it has no content - allows for a full-width content option.
    let col2 = $("#s-lg-col-2");
    if (col2.length > 0 && col2[0].childNodes[1].childNodes.length === 0) col2.remove();

    // Combine adjacent lists of links and books
    // loop through all boxes
    for (let box of $(".s-lib-box-content")) {
        // loop through all lists of links
        let count = 0;
        while ($(box).find(".s-lg-link-list-2").length > count) {
            let item = $(box).find(".s-lg-link-list-2")[count];
            let prevList = $(item).parent().prev("div").children(".s-lg-link-list-5");
            let nextList = $(item).parent().next("div").children(".s-lg-link-list-5");
            if (prevList.length > 0 && nextList.length > 0) {
                $(item).children("li").appendTo(prevList);
                $(item).parent("div").remove();
                nextList.children("li").appendTo(prevList);
                nextList.parent("div").remove();
                prevList.addClass("list-merge");
            } else if (prevList.length > 0) {
                $(item).children("li").appendTo(prevList);
                $(item).parent("div").remove();
                prevList.addClass("list-merge");
            } else if (nextList.length > 0) {
                $(item).children("li").prependTo(nextList);
                $(item).parent("div").remove();
                nextList.addClass("list-merge");
            } else {
                count++;
            }
        }
    }
    $(".list-merge").addClass("s-lg-link-list-2");
}