<?php

// global settings
$datafile = '../data/data.json';
$password = '';

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
				echo '{}';
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
