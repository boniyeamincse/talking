<?php

namespace App\Exceptions;

use Exception;

class UserBlockedException extends Exception
{
    protected $message = 'Cannot call this user';
    protected $code = 403;
}
