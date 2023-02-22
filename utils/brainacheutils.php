<?php

namespace brainache\utils;

function printHeader($title)
{
?>
    <header>
        <div class="header-holder">
            <div class="header-curr-section-title label red"><?php echo $title ?></div>
            <div class="header-logo-holder">
                <img class="img-fill" src="/img/brainache_logo_typo.png" alt="">
            </div>
        </div>
    </header>
<?php
}


?>