<?php

namespace App\Exceptions;

use Exception;

class UserBusyException extends Exception
{
    protected $message = 'User is currently in another call';
    protected $code = 422;
}
