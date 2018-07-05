$(function () {

    // change textarea to CK editor
    if($('textarea#ta').length){
        ClassicEditor
            .create( document.querySelector( '#ta' ) )
            .catch( error => {
                console.error( error );
            } );
    }

    // confirm delete
    $('a.confirmDelete').on('click',function () {
        console.log()
        if(!confirm('Confirm Deletion')){
            return false;
        }
    });

    //call fancybox
    if($("[data-fancybox]").length){
        $("[data-fancybox]").fancybox();
    }

    //Clear cart
    $('a.clearcart').on('click',function () {
        console.log()
        if(!confirm('Confirm Clear Cart')){
            return false;
        }
    })
})