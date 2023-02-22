<!DOCTYPE html>

<?php
require 'utils/brainacheutils.php';

use brainache\utils as bu;
?>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brainache | Games</title>
    <link rel="stylesheet" href="/css/generic.css">
    <link rel="stylesheet" href="/css/utils/header.css">
    <link rel="stylesheet" href="/css/games.css">
</head>

<body>
    <div class="brain-root">
        <?php
        bu\printHeader("GAMES");
        ?>
        <div class="brain-content">
            <div class="label underscored">SELECTION OF GAMES</div>
            <ul class="brain-list-nd games-list">
                <a href="/coin.html">
                    <li class="label game-label">&#129689; COIN OF DESTINY</li>
                </a>
            </ul>
        </div>

    </div>

</body>

</html>
