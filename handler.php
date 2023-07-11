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
		case 'sms':
			$res = file_get_contents($smsurl . $_POST['data']);
			echo '{"result": "' . $res . '"}';
		break;

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
				echo '{}';
			}			
		break;

		case 'cal':
			if (file_exists($icsfile))
			{
				$result = array();
				$result["ics"] = file_get_contents($icsfile);
				echo json_encode($result);
			}
			else
			{
				echo '{"warning": "cannot load ics file"}';
			}
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
