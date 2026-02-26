<?php

namespace App\Exceptions;

use Exception;

class UserOfflineException extends Exception
{
    protected $message = 'User is currently offline';
    protected $code = 422;
}
