<?php

namespace App\Exceptions;

use Exception;

class InvalidCallStateException extends Exception
{
    protected $message = 'Invalid call state transition';
    protected $code = 422;
}
