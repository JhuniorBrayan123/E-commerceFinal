<?php

class MockPhpStream
{
    public static $content;
    private $position = 0;

    public function stream_open($path, $mode, $options, &$opened_path)
    {
        $this->position = 0;
        return true;
    }

    public function stream_read($count)
    {
        $ret = substr(self::$content, $this->position, $count);
        $this->position += strlen($ret);
        return $ret;
    }

    public function stream_eof()
    {
        return $this->position >= strlen(self::$content);
    }
    
    public function stream_stat()
    {
        return [
            'size' => strlen(self::$content),
        ];
    }
}
