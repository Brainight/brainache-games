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
            <div>
                <h2 class="b-label b-underscored" style="width: 50%" ;>SELECTION OF GAMES</h2>
            </div>
            <ul class="brain-list-nd games-list">
                <li>
                    <a class="b-label game-label" href="/coin.html">&#129689; COIN OF DESTINY</a>
                </li>
                <li>
                    <a class="b-label game-label" href="/bricksnake.html">&#128013; BRICK SNAKE</a>
                </li>
            </ul>
        </div>

    </div>

</body>

</html>