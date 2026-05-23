var kjempekjekt = kjempekjekt || {};

kjempekjekt.search = function() {
  var query = $("#searchInput").val();
  document.location = "https://www.google.com/search?q=site%3Aprogrammeringsbloggen.no+" + query;
};

kjempekjekt.loadSidebar = function() {

  var items = [],
      sidebar = $("#sidebar");

  if (sidebar.length && sidebar.length > 0) {
    var basePath = window.location.pathname.startsWith('/blog/') ? '/blog' : '';
    $.getJSON(basePath + '/ajax/sidebar.json?' + Date.now(), function(data) {

      items.push(
        "<div class=\"thumbnail\"><a href=\"" + basePath + "/tags/"
        + data.featuredTag.slug
        + "\"><img src=\"" + basePath + "/assets/images/bb/" 
        + data.featuredTag.image 
        + "\"></a><div class=\"caption\"><h4>"
        + data.featuredTag.name
        + "</h4><p>"
        + data.featuredTag.text
        + "</p><p><a href=\"" + basePath + "/tags/"
        + data.featuredTag.slug
        + "\">Alle poster i denne kategorien..</a></p></div></div>");

      data.features.forEach(function(feature) {
        items.push(
          "<div class=\"thumbnail\"><a href=\""
          + feature.link
          + "\"><img src=\"" + basePath + "/assets/images/bb/" 
          + feature.image 
          + "\"></a><div class=\"caption\"><h4>"
          + feature.heading
          + "</h4><p>"
          + feature.text
          + "</p><p><a href=\""
          + feature.link
          + "\">Les artikkelen..</a></p></div></div>");
      });

      items.push("<div><h3>De nyeste bloggpostene</h3><ul>");
      data.posts.forEach(function(post) {
        items.push("<li><a href=\"" + post.link + "\">" + post.title + "</a></li>");
      });
      items.push("</ul></div>");

      sidebar.html(items.join(""));
    });
  }
};

$(function() {
  $("#searchInput").keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      kjempekjekt.search();
    }
  });

  kjempekjekt.loadSidebar();
});
