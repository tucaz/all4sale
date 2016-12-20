$(function () {
    //Image gallery
    var mainImage = $("#main-image");

    $("#images a").each(function (index, link) {
        link = $(link);
        var src = link.find("img").attr("data-src-large");
        link.click(function (e) {
            mainImage.attr("src", src);
            e.preventDefault();
        });
    });
    //

    //Send email form
    $("form").submit(function (e) {
        var nameField = $("#name"),
            emailField = $("#email"),
            emailUrl = "/email",
            data = {
                name: nameField.val(),
                email: emailField.val(),
                phone: $("#phone").val(),
                city: $("#city").val(),
                message: $("#message").val(),
                product: $("#product").val()
            },
            validForm = true;

        nameField.closest(".form-group").removeClass("has-error");
        emailField.closest(".form-group").removeClass("has-error");

        if (data.name.trim() == "") {
            nameField.closest(".form-group").addClass("has-error");
            nameField.focus();
            validForm = false;
        }

        if (!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi.test(data.email)) {
            emailField.closest(".form-group").addClass("has-error");
            emailField.focus();
            validForm = false;
        }

        if (!validForm) {
            e.preventDefault();
            return;
        }

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: emailUrl,
            data: JSON.stringify(data),
            dataType: "json",
            complete: function (result, status) {
                $('html, body').animate({
                    scrollTop: $("#success-message").offset().top
                });

                $("#success-message").show(1000);
                $("#buy").hide(2000);
            }
        });

        e.preventDefault();
    });
    //
});