<?php

require 'settings.php';

// check authent
if ($password && (!isset($_POST['password']) || $_POST['password'] != $password))
{
	echo '{"error": "authent"}';
}
else if (isset($_POST['action']))
{
	$action = $_POST['action'];
	switch ($action)
	{
		case 'fetch':
			if (file_exists($datafile))
			{
				echo file_get_contents($datafile);
			}
			else
			{
				echo '[]';
			}
		break;

		case 'push':
			$result = file_put_contents($datafile, $_POST['data']);
			if ($result === false)
			{
				echo '{"error": "could not save ' . $datafile . '"}';
			}
			else
			{
				echo '{"result": "ok"}';
			}
		break;

		case 'cal':
			if ($icsfile)
			{
				$result = array();
				$result["ics"] = file_get_contents($icsfile);
				echo json_encode($result);
			}
			else
			{
				echo '{"error": "cannot load ics file"}';
			}
		break;

		case 'title':
			$result = array();
			$str = file_get_contents($_POST['data']);
			if(strlen($str) > 0)
			{
				preg_match("/\<title\>(.*)\<\/title\>/", $str, $title);
				$result['title'] = $title[1];
			}
			echo json_encode($result);
		break;

		default:
			echo '{"error": "unknown action ' . $action . '"}';
		break;
	}
}
else
{
	echo '{"error": "missing action parameter"}';
}

?>
