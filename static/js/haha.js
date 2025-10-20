$(".rename").click(function(){
  let span=$("#project-name");
  let item=`<input type="text" class="${span.attr('class')}" id="${span.attr('id')}" value="${span.text()}"/>`;
  $(item).insertBefore(span);
  span.hide();
  $("#project-name").val(span.text()).select();
  $("#project-name").bind("blur",function(){
    let value=$(this).val();
    span.text(value);
    $("#project-name").remove();
    span.show();
  });
});

$("body").on("click","#downloadBtn",function(){
  let myReport=$("iframe").contents().find(".ke-content").html();
  let html="<html>"+myReport+"</html>";
  XDoc.to(html, "doc", {}, "_blank");
});

$(".reportEditor").click(function(){
  if($("#editor").hasClass("visible")){
    $("#editor").removeClass("visible");
  }else{
    $("#editor").addClass("visible");
  }
});

$("#closeBtn").click(function(){
  $("#editor").removeClass("visible");
});

$(function(){ $("#editor").draggable({handle:"#editorHandle"});})
