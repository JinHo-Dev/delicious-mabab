'use strict';

import { User } from '../../config/db';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

/**
 * Get list of users
 * restriction: 'admin'
 */
export async function index(req, res) {
  const users = await User.findAll({
    attributes: [
      'id',
      'name',
      'email',
      'role',
    ]
  });

  res.status(200).json(users);
}

/**
 * Creates a new user
 */
export async function create(req, res) {
  // 중복 체크
  const validUser = await User.find({
    where: {
      email: req.body.email,
    },
  })
  if (validUser) {
    return res.status(404).send({
      msg: '이미 존재하는 이메일 입니다.'
    })
  }

  const newUser = User.build(req.body);
  newUser.setDataValue('role', 'user')

  const user = await newUser.save()

  const token = jwt.sign({ id: user.id }, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });

  res.status(201).json({ token });
}

/**
 * Get a single user
 */
export async function show(req, res) {
  const userId = req.params.id;

  const user = await User.find({
    where: {
      id: userId
    }
  })

  if (!user) {
    return res.status(404).end()
  }
  res.json(user.profile)
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export async function destroy(req, res) {
  await User.destroy({ where: { id: req.params.id } })

  res.status(204).end();
}

/**
 * Change a users password
 */
export async function changePassword(req, res) {
  const userId = req.user.id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  const user = await User.find({
    where: {
      id: userId
    }
  })

  const authResult = await user.authenticate(oldPass)
  if (authResult) {
    user.password = newPass
    await user.save()

    res.status(204).end()
  } else {
    res.status(403).end()
  }
}

export async function change(req, res) {
  const userId = req.params.id;

  const user = await User.find({
    where: {
      id: userId
    }
  })

  if (user) {
    user.email = req.body.email ? req.body.email : user.email
    user.name = req.body.name ? req.body.name : user.name
    user.role = req.body.role ? req.body.role : user.role
    user.password = req.body.password ? req.body.password : user.password

    await user.save()

    res.status(204).end()
  } else {
    res.statsu(404).end()
  }
}

/**
 * Get my info
 */
export async function me(req, res) {
  const userId = req.user.id

  const user = await User.find({
    where: {
      id: userId
    },
    attributes: [
      'id',
      'name',
      'email',
      'role'
    ]
  })
  if (!user) {
    return res.status(401).end();
  }
  res.json(user);
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
